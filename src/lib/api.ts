export type PredictionResponse = {
  smiles: string;
  valid: boolean;
  descriptors: {
    molecular_weight: number;
    logp: number;
    tpsa: number;
    h_donors: number;
    h_acceptors: number;
    num_rotatable_bonds: number;
  };
  prediction: {
    property_name: string;
    score: number;
    label: string;
  };
};

export type AdmetResponse = {
  smiles: string;
  // Physicochemical
  molecular_weight: number;
  logp: number;
  tpsa: number;
  h_donors: number;
  h_acceptors: number;
  num_rotatable_bonds: number;
  num_rings: number;
  num_aromatic_rings: number;
  fsp3: number;
  heavy_atom_count: number;
  molar_refractivity: number;
  num_stereocenters: number;
  // Rule filters
  ro5_violations: number;
  ro5_pass: boolean;
  veber_pass: boolean;
  egan_pass: boolean;
  ghose_pass: boolean;
  // ADMET
  bbb_penetrant: boolean;
  herg_risk: boolean;
  pains_alerts: string[];
  num_pains_alerts: number;
  // Estimates
  synthetic_accessibility: number;
  solubility_log_mol_l: number;
  drug_likeness_score: number;
};

export type SimilarCompound = {
  chembl_id: string | null;
  name: string | null;
  similarity: number | null;
  molecular_weight: number | null;
  logp: number | null;
  smiles: string | null;
  max_phase: number | null;
  molecule_type: string | null;
};

export type TargetResult = {
  target_chembl_id: string;
  target_name: string;
  organism: string | null;
  standard_type: string | null;
  standard_value: number | null;
  standard_units: string | null;
  assay_type: string | null;
  found_via: string[];
  similar_compound_name: string | null;
};

export type TargetsResponse = {
  smiles: string;
  similar_compounds: SimilarCompound[];
  targets: TargetResult[];
};

export type SimilarityResponse = {
  smiles: string;
  results: SimilarCompound[];
};

export type MolblockResponse = {
  smiles: string;
  molblock: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    let detail = text;
    try {
      detail = JSON.parse(text)?.detail ?? text;
    } catch {}
    throw new Error(detail || "Request failed");
  }
  return response.json();
}

export async function predictMolecule(smiles: string): Promise<PredictionResponse> {
  return apiPost<PredictionResponse>("/predict", { smiles });
}

export async function fetchAdmet(smiles: string): Promise<AdmetResponse> {
  return apiPost<AdmetResponse>("/admet", { smiles });
}

export async function fetchTargets(
  smiles: string,
  similarityThreshold = 70,
  maxCompounds = 3
): Promise<TargetsResponse> {
  return apiPost<TargetsResponse>("/targets", {
    smiles,
    similarity_threshold: similarityThreshold,
    max_compounds: maxCompounds,
  });
}

export async function fetchSimilarity(
  smiles: string,
  threshold = 70,
  limit = 10
): Promise<SimilarityResponse> {
  return apiPost<SimilarityResponse>("/similarity", { smiles, threshold, limit });
}

export async function fetchMolblock(smiles: string): Promise<MolblockResponse> {
  return apiPost<MolblockResponse>("/molblock", { smiles });
}