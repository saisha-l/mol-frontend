from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    PredictRequest,
    PredictResponse,
    MolblockRequest,
    MolblockResponse,
)
from app.chemistry import compute_descriptors, generate_molblock
from app.model import mock_predict_property

app = FastAPI(title="Molecular Property API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    try:
        descriptors = compute_descriptors(request.smiles)
        prediction = mock_predict_property(descriptors)

        return {
            "smiles": request.smiles,
            "valid": True,
            "descriptors": descriptors,
            "prediction": prediction,
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/molblock", response_model=MolblockResponse)
async def molblock(request: MolblockRequest):
    """Generate a 3D molblock from a SMILES string for 3D visualization."""
    try:
        mol_block = generate_molblock(request.smiles)
        return {
            "smiles": request.smiles,
            "molblock": mol_block,
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")