from rdkit import Chem
from rdkit.Chem import Descriptors, Crippen, Lipinski, rdMolDescriptors


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