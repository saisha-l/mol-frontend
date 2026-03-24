# Molecular Property Predictor

Web application created for predicting molecular properties using SMILES strings. To use it just enter a molecule and you'll get computer chemical descriptors, drug likeliness prediction and an interactive 3D visualization of the molecule.
 
---

## Architecture
 
```
┌─────────────────────────┐       ┌──────────────────────────────┐
│   Next.js Frontend      │       │   FastAPI Backend             │
│                         │       │                              │
│  MoleculeForm           │  POST │  /predict                    │
│  → enters SMILES ───────┼──────►│  → compute_descriptors()     │
│                         │       │  → mock_predict_property()   │
│  PredictionCard         │◄──────┼── returns descriptors+score  │
│  → shows results        │       │                              │
│                         │  POST │  /molblock                   │
│  MoleculeViewer         │──────►│  → generate_molblock()       │
│  → 3Dmol.js renders 3D │◄──────┼── returns SDF molblock       │
└─────────────────────────┘       └──────────────────────────────┘
```
 
---
 
## Tech Stack
 
### Frontend
* Next.js - React framework 
* React - For UI components
* TypeScript 
* 3dmol.js - Interactive 3D molecular visualization
* Tailwind CSS 
* ESLint

### Backend
* FastAPI - Async Python web framework with automatic OpenAPI docs
* Uvicorn - ASGI server
* Pydantic - Request/response validation and serialization
* RDKit - Cheminformatics toolkit for SMILES parsing, descriptor calculation, 3D conformer generation, geometry optimization

