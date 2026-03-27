import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    PredictRequest,
    PredictResponse,
    MolblockRequest,
    MolblockResponse,
    AdmetRequest,
    AdmetResponse,
    TargetsRequest,
    TargetsResponse,
    SimilarityRequest,
    SimilarityResponse,
)
from app.chemistry import compute_descriptors, generate_molblock, compute_admet
from app.chembl import search_similar_compounds, get_targets_for_smiles
from app.model import mock_predict_property

app = FastAPI(title="Molecular Discovery API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.2.0"}


# ── Legacy predict ─────────────────────────────────────────────────────────────

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


# ── 3D structure ───────────────────────────────────────────────────────────────

@app.post("/molblock", response_model=MolblockResponse)
async def molblock(request: MolblockRequest):
    try:
        mol_block = generate_molblock(request.smiles)
        return {"smiles": request.smiles, "molblock": mol_block}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


# ── ADMET analysis ─────────────────────────────────────────────────────────────

@app.post("/admet", response_model=AdmetResponse)
async def admet(request: AdmetRequest):
    """
    Full ADMET property panel: physicochemical descriptors, rule-based filters
    (Ro5, Veber, Egan, Ghose), BBB penetration estimate, hERG flag, PAINS alerts,
    synthetic accessibility, and aqueous solubility estimate.
    """
    try:
        result = compute_admet(request.smiles)
        return {"smiles": request.smiles, **result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"ADMET computation failed: {exc}")


# ── ChEMBL protein targets ─────────────────────────────────────────────────────

@app.post("/targets", response_model=TargetsResponse)
async def targets(request: TargetsRequest):
    """
    Find known protein targets via ChEMBL:
    1. Similarity search → top similar approved/clinical compounds
    2. Activity lookup → known protein targets with bioactivity data
    """
    try:
        result = await get_targets_for_smiles(
            smiles=request.smiles,
            similarity_threshold=request.similarity_threshold,
            max_compounds=request.max_compounds,
        )
        return {"smiles": request.smiles, **result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"ChEMBL API error: {exc.response.status_code}",
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"ChEMBL unreachable: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Target search failed: {exc}")


# ── ChEMBL similarity search ───────────────────────────────────────────────────

@app.post("/similarity", response_model=SimilarityResponse)
async def similarity(request: SimilarityRequest):
    """
    Search ChEMBL for structurally similar compounds using
    Morgan fingerprints + Tanimoto similarity.
    """
    try:
        results = await search_similar_compounds(
            smiles=request.smiles,
            similarity=request.threshold,
            limit=request.limit,
        )
        return {"smiles": request.smiles, "results": results}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"ChEMBL API error: {exc.response.status_code}",
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"ChEMBL unreachable: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Similarity search failed: {exc}")