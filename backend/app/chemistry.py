from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, Crippen, Lipinski, rdMolDescriptors


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


def generate_molblock(smiles: str) -> str:
    """
    Generate a 3D molblock (SDF/MOL format) from a SMILES string.
    Uses RDKit to add hydrogens, embed 3D coordinates, and optimize geometry.
    """
    mol = parse_molecule(smiles)
    mol = Chem.AddHs(mol)

    # Generate 3D coordinates
    result = AllChem.EmbedMolecule(mol, AllChem.ETKDGv3())
    if result == -1:
        # Fallback: use random coordinates if embedding fails
        AllChem.EmbedMolecule(mol, AllChem.ETKDGv3(), useRandomCoords=True)

    # Optimize geometry with MMFF force field
    try:
        AllChem.MMFFOptimizeMolecule(mol, maxIters=200)
    except Exception:
        # If MMFF fails, try UFF
        try:
            AllChem.UFFOptimizeMolecule(mol, maxIters=200)
        except Exception:
            pass  # Use unoptimized coordinates

    return Chem.MolToMolBlock(mol)