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
  
  export type MolblockResponse = {
    smiles: string;
    molblock: string;
  };
  
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
  
  export async function predictMolecule(
    smiles: string
  ): Promise<PredictionResponse> {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ smiles }),
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Request failed");
    }
  
    return response.json();
  }
  
  export async function fetchMolblock(
    smiles: string
  ): Promise<MolblockResponse> {
    const response = await fetch(`${API_BASE_URL}/molblock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ smiles }),
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to generate 3D coordinates");
    }
  
    return response.json();
  }