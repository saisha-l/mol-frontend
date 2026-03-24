"use client";

import { useState } from "react";
import MoleculeForm from "@/components/MoleculeForm";
import PredictionCard from "@/components/PredictionCard";
import MoleculeViewer from "@/components/MoleculeViewer";
import { predictMolecule, PredictionResponse } from "@/lib/api";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(smiles: string) {
    setLoading(true);
    setError(null);

    try {
      const result = await predictMolecule(smiles);
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div style={{ marginBottom: 24 }}>
        <h1>Molecular Property Predictor</h1>
        <p className="muted">
          Starter project for cheminformatics + ML infrastructure roles.
        </p>
      </div>

      <MoleculeForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div className="card">
          <h2>Error</h2>
          <p className="error">{error}</p>
        </div>
      )}

      <MoleculeViewer smiles={data?.smiles ?? null} />

      {data && <PredictionCard data={data} />}
    </main>
  );
}