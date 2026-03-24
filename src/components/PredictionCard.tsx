import { PredictionResponse } from "@/lib/api";

type Props = {
  data: PredictionResponse;
};

export default function PredictionCard({ data }: Props) {
  const d = data.descriptors;
  const p = data.prediction;

  return (
    <div className="card">
      <h2>Prediction Output</h2>
      <p className="muted">
        Parsed molecule: <code>{data.smiles}</code>
      </p>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div>
          <h3>Descriptors</h3>
          <p>Molecular weight: {d.molecular_weight}</p>
          <p>logP: {d.logp}</p>
          <p>TPSA: {d.tpsa}</p>
          <p>H-bond donors: {d.h_donors}</p>
          <p>H-bond acceptors: {d.h_acceptors}</p>
          <p>Rotatable bonds: {d.num_rotatable_bonds}</p>
        </div>

        <div>
          <h3>Model Output</h3>
          <p>Property: {p.property_name}</p>
          <p>Score: {p.score}</p>
          <p>Label: {p.label}</p>
        </div>
      </div>
    </div>
  );
}