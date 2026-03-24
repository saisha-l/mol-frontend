"use client";

import { useState } from "react";

type Props = {
  onSubmit: (smiles: string) => Promise<void>;
  loading: boolean;
};

export default function MoleculeForm({ onSubmit, loading }: Props) {
  const [smiles, setSmiles] = useState("CCO");

  return (
    <div className="card">
      <h2>Input Molecule</h2>
      <p className="muted">
        Enter a SMILES string. Example: <code>CCO</code>, <code>c1ccccc1</code>,
        <code>CC(=O)Oc1ccccc1C(=O)O</code>
      </p>

      <div style={{ marginTop: 16 }}>
        <div className="label">SMILES</div>
        <textarea
          rows={4}
          value={smiles}
          onChange={(e) => setSmiles(e.target.value)}
          placeholder="Enter SMILES string..."
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => onSubmit(smiles)}
          disabled={loading || !smiles.trim()}
        >
          {loading ? "Analyzing..." : "Run Prediction"}
        </button>
      </div>
    </div>
  );
}