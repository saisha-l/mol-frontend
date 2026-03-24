from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    smiles: str = Field(..., min_length=1, description="SMILES string")


class MolblockRequest(BaseModel):
    smiles: str = Field(..., min_length=1, description="SMILES string")


class MolblockResponse(BaseModel):
    smiles: str
    molblock: str


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


class PredictResponse(BaseModel):
    smiles: str
    valid: bool
    descriptors: DescriptorResponse
    prediction: PredictionOutput