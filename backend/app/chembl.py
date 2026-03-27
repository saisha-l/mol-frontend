"""
ChEMBL REST API integration for protein target lookup and drug similarity search.
Docs: https://chembl.gitbook.io/chembl-interface-documentation/web-services/chembl-data-web-services
"""

import httpx
from typing import Optional

CHEMBL_BASE = "https://www.ebi.ac.uk/chembl/api/data"
HEADERS = {"Accept": "application/json"}
TIMEOUT = 15.0


async def search_similar_compounds(
    smiles: str,
    similarity: int = 70,
    limit: int = 10,
) -> list[dict]:
    """
    Search ChEMBL for compounds similar to the query SMILES using
    the similarity endpoint (Tanimoto, Morgan fingerprints).
    Returns list of similar compounds with basic properties.
    """
    url = f"{CHEMBL_BASE}/similarity/{smiles}/{similarity}.json"
    params = {"limit": limit, "offset": 0}

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url, headers=HEADERS, params=params)
        resp.raise_for_status()
        data = resp.json()

    results = []
    for compound in data.get("molecules", []):
        props = compound.get("molecule_properties") or {}
        struct = compound.get("molecule_structures") or {}
        results.append({
            "chembl_id": compound.get("molecule_chembl_id"),
            "name": compound.get("pref_name") or "—",
            "similarity": compound.get("similarity"),
            "molecular_weight": props.get("mw_freebase"),
            "logp": props.get("alogp"),
            "smiles": struct.get("canonical_smiles"),
            "max_phase": compound.get("max_phase"),
            "molecule_type": compound.get("molecule_type"),
        })

    return results


async def search_targets_by_compound(
    chembl_id: str,
    limit: int = 8,
) -> list[dict]:
    """
    Given a ChEMBL compound ID, find known protein targets with activity data.
    Joins activity → target data.
    """
    url = f"{CHEMBL_BASE}/activity.json"
    params = {
        "molecule_chembl_id": chembl_id,
        "limit": limit,
        "offset": 0,
        "target_type": "SINGLE PROTEIN",
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url, headers=HEADERS, params=params)
        resp.raise_for_status()
        data = resp.json()

    seen = {}
    for act in data.get("activities", []):
        tid = act.get("target_chembl_id")
        if not tid or tid in seen:
            continue
        seen[tid] = {
            "target_chembl_id": tid,
            "target_name": act.get("target_pref_name") or "Unknown",
            "organism": act.get("target_organism") or "—",
            "standard_type": act.get("standard_type"),
            "standard_value": act.get("standard_value"),
            "standard_units": act.get("standard_units"),
            "assay_type": act.get("assay_type"),
        }

    return list(seen.values())


async def get_targets_for_smiles(
    smiles: str,
    similarity_threshold: int = 70,
    max_compounds: int = 3,
    max_targets: int = 10,
) -> dict:
    """
    Full pipeline:
    1. Find similar compounds in ChEMBL
    2. For each top compound, fetch known protein targets
    3. Deduplicate and return ranked target list
    """
    similar = await search_similar_compounds(smiles, similarity_threshold, max_compounds)

    all_targets: dict[str, dict] = {}
    for compound in similar:
        cid = compound.get("chembl_id")
        if not cid:
            continue
        try:
            targets = await search_targets_by_compound(cid, limit=5)
            for t in targets:
                tid = t["target_chembl_id"]
                if tid not in all_targets:
                    all_targets[tid] = {**t, "found_via": [cid], "similar_compound_name": compound["name"]}
                else:
                    all_targets[tid]["found_via"].append(cid)
        except Exception:
            continue

    ranked = sorted(all_targets.values(), key=lambda x: len(x["found_via"]), reverse=True)
    return {
        "similar_compounds": similar,
        "targets": ranked[:max_targets],
    }