from pydantic import BaseModel, Field
from typing import Optional


# ── Requests ──────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    smiles: str = Field(..., min_length=1, description="SMILES string")


class MolblockRequest(BaseModel):
    smiles: str = Field(..., min_length=1, description="SMILES string")


class AdmetRequest(BaseModel):
    smiles: str = Field(..., min_length=1, description="SMILES string")


class TargetsRequest(BaseModel):
    smiles: str = Field(..., min_length=1, description="SMILES string")
    similarity_threshold: int = Field(70, ge=40, le=100)
    max_compounds: int = Field(3, ge=1, le=10)


class SimilarityRequest(BaseModel):
    smiles: str = Field(..., min_length=1, description="SMILES string")
    threshold: int = Field(70, ge=40, le=100)
    limit: int = Field(10, ge=1, le=25)


# ── Sub-schemas ────────────────────────────────────────────────────────────────

class DescriptorResponse(BaseModel):
    molecular_weight: float
    logp: float
    tpsa: float
    h_donors: int
    h_acceptors: int
    num_rotatable_bonds: int


class PredictionOutput(BaseModel):
    property_name: str
    score: float
    label: str


class AdmetResponse(BaseModel):
    smiles: str
    # Physicochemical
    molecular_weight: float
    logp: float
    tpsa: float
    h_donors: int
    h_acceptors: int
    num_rotatable_bonds: int
    num_rings: int
    num_aromatic_rings: int
    fsp3: float
    heavy_atom_count: int
    molar_refractivity: float
    num_stereocenters: int
    # Rule filters
    ro5_violations: int
    ro5_pass: bool
    veber_pass: bool
    egan_pass: bool
    ghose_pass: bool
    # ADMET flags
    bbb_penetrant: bool
    herg_risk: bool
    pains_alerts: list[str]
    num_pains_alerts: int
    # Estimates
    synthetic_accessibility: float
    solubility_log_mol_l: float
    drug_likeness_score: float


class SimilarCompound(BaseModel):
    chembl_id: Optional[str]
    name: Optional[str]
    similarity: Optional[float]
    molecular_weight: Optional[float]
    logp: Optional[float]
    smiles: Optional[str]
    max_phase: Optional[int]
    molecule_type: Optional[str]


class TargetResult(BaseModel):
    target_chembl_id: str
    target_name: str
    organism: Optional[str]
    standard_type: Optional[str]
    standard_value: Optional[float]
    standard_units: Optional[str]
    assay_type: Optional[str]
    found_via: list[str]
    similar_compound_name: Optional[str]


class TargetsResponse(BaseModel):
    smiles: str
    similar_compounds: list[SimilarCompound]
    targets: list[TargetResult]


class SimilarityResponse(BaseModel):
    smiles: str
    results: list[SimilarCompound]


# ── Legacy ─────────────────────────────────────────────────────────────────────

class MolblockResponse(BaseModel):
    smiles: str
    molblock: str


class PredictResponse(BaseModel):
    smiles: str
    valid: bool
    descriptors: DescriptorResponse
    prediction: PredictionOutput