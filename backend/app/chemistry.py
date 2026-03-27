from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, Crippen, Lipinski, rdMolDescriptors
from rdkit.Chem import FilterCatalog
from rdkit.Chem.FilterCatalog import FilterCatalogParams


def parse_molecule(smiles: str):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError("Invalid SMILES string.")
    return mol


def compute_descriptors(smiles: str) -> dict:
    mol = parse_molecule(smiles)

    return {
        "molecular_weight": round(Descriptors.MolWt(mol), 3),
        "logp": round(Crippen.MolLogP(mol), 3),
        "tpsa": round(rdMolDescriptors.CalcTPSA(mol), 3),
        "h_donors": int(Lipinski.NumHDonors(mol)),
        "h_acceptors": int(Lipinski.NumHAcceptors(mol)),
        "num_rotatable_bonds": int(Lipinski.NumRotatableBonds(mol)),
    }


def compute_admet(smiles: str) -> dict:
    """
    Compute extended ADMET-relevant descriptors using RDKit.
    Returns rule-based flags and continuous property estimates.
    """
    mol = parse_molecule(smiles)

    mw = Descriptors.MolWt(mol)
    logp = Crippen.MolLogP(mol)
    tpsa = rdMolDescriptors.CalcTPSA(mol)
    hbd = Lipinski.NumHDonors(mol)
    hba = Lipinski.NumHAcceptors(mol)
    rot = Lipinski.NumRotatableBonds(mol)
    rings = rdMolDescriptors.CalcNumRings(mol)
    arom_rings = rdMolDescriptors.CalcNumAromaticRings(mol)
    heavy_atoms = mol.GetNumHeavyAtoms()
    fsp3 = rdMolDescriptors.CalcFractionCSP3(mol)
    molar_refractivity = Crippen.MolMR(mol)
    num_stereo = len(Chem.FindMolChiralCenters(mol, includeUnassigned=True))

    # --- Lipinski Ro5 ---
    ro5_violations = sum([
        mw > 500,
        logp > 5,
        hbd > 5,
        hba > 10,
    ])

    # --- Veber rules (oral bioavailability) ---
    veber_pass = rot <= 10 and tpsa <= 140

    # --- Egan rules (absorption) ---
    egan_pass = -1 <= logp <= 5.88 and tpsa <= 131.6

    # --- Ghose filter ---
    ghose_pass = (
        160 <= mw <= 480
        and -0.4 <= logp <= 5.6
        and 20 <= heavy_atoms <= 70
        and 40 <= molar_refractivity <= 130
    )

    # --- BBB penetration estimate (simple logP/TPSA heuristic) ---
    # Based on: logP 1-3, TPSA < 90, MW < 450, HBD <= 3
    bbb_score = sum([
        1 <= logp <= 3,
        tpsa < 90,
        mw < 450,
        hbd <= 3,
    ])
    bbb_predicted = bbb_score >= 3

    # --- hERG liability flag (crude: logP > 3.7 AND basic N present) ---
    has_basic_n = any(
        atom.GetAtomicNum() == 7 and atom.GetTotalNumHs() > 0
        for atom in mol.GetAtoms()
    )
    herg_risk = logp > 3.7 and has_basic_n

    # --- PAINS filter ---
    pains_params = FilterCatalogParams()
    pains_params.AddCatalog(FilterCatalogParams.FilterCatalogs.PAINS)
    pains_catalog = FilterCatalog.FilterCatalog(pains_params)
    pains_matches = pains_catalog.GetMatches(mol)
    pains_alerts = [m.GetDescription() for m in pains_matches]

    # --- Synthetic accessibility score (simple approximation) ---
    # Uses ring complexity + stereocenters + heavy atoms as proxy
    sa_penalty = (arom_rings * 0.5) + (num_stereo * 1.5) + (max(0, heavy_atoms - 30) * 0.1)
    sa_score_approx = min(10.0, max(1.0, round(1 + sa_penalty, 1)))

    # --- Solubility estimate (ESOL-inspired, simplified) ---
    esol_approx = round(
        0.16 - 0.63 * logp - 0.0062 * mw + 0.066 * rot - 0.74,
        2
    )

    return {
        # Core physicochemical
        "molecular_weight": round(mw, 2),
        "logp": round(logp, 2),
        "tpsa": round(tpsa, 2),
        "h_donors": int(hbd),
        "h_acceptors": int(hba),
        "num_rotatable_bonds": int(rot),
        "num_rings": int(rings),
        "num_aromatic_rings": int(arom_rings),
        "fsp3": round(fsp3, 3),
        "heavy_atom_count": int(heavy_atoms),
        "molar_refractivity": round(molar_refractivity, 2),
        "num_stereocenters": int(num_stereo),

        # Rule-based filters
        "ro5_violations": int(ro5_violations),
        "ro5_pass": ro5_violations <= 1,
        "veber_pass": bool(veber_pass),
        "egan_pass": bool(egan_pass),
        "ghose_pass": bool(ghose_pass),

        # ADMET predictions
        "bbb_penetrant": bool(bbb_predicted),
        "herg_risk": bool(herg_risk),
        "pains_alerts": pains_alerts,
        "num_pains_alerts": len(pains_alerts),

        # Computed estimates
        "synthetic_accessibility": sa_score_approx,
        "solubility_log_mol_l": esol_approx,

        # Derived drug-likeness summary
        "drug_likeness_score": round(
            (
                (1 if ro5_violations <= 1 else 0) * 0.30
                + (1 if veber_pass else 0) * 0.15
                + (1 if egan_pass else 0) * 0.15
                + (1 if not herg_risk else 0) * 0.20
                + (1 if len(pains_alerts) == 0 else 0) * 0.20
            ),
            2
        ),
    }


def compute_morgan_fingerprint(smiles: str, radius: int = 2, n_bits: int = 2048) -> list[int]:
    mol = parse_molecule(smiles)
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius, nBits=n_bits)
    return list(fp.ToBitString())


def tanimoto_similarity(smiles1: str, smiles2: str) -> float:
    from rdkit import DataStructs
    mol1 = parse_molecule(smiles1)
    mol2 = parse_molecule(smiles2)
    fp1 = AllChem.GetMorganFingerprintAsBitVect(mol1, 2, nBits=2048)
    fp2 = AllChem.GetMorganFingerprintAsBitVect(mol2, 2, nBits=2048)
    return round(float(DataStructs.TanimotoSimilarity(fp1, fp2)), 4)


def generate_molblock(smiles: str) -> str:
    mol = parse_molecule(smiles)
    mol = Chem.AddHs(mol)

    result = AllChem.EmbedMolecule(mol, AllChem.ETKDGv3())
    if result == -1:
        AllChem.EmbedMolecule(mol, AllChem.ETKDGv3(), useRandomCoords=True)

    try:
        AllChem.MMFFOptimizeMolecule(mol, maxIters=200)
    except Exception:
        try:
            AllChem.UFFOptimizeMolecule(mol, maxIters=200)
        except Exception:
            pass

    return Chem.MolToMolBlock(mol)