"use client";

import { AdmetResponse } from "@/lib/api";

type Props = { data: AdmetResponse };

function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--amber)" : "var(--red)";
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-label">
        <span>{label}</span>
        <span className="score-num" style={{ color }}>
          {pct}
          <span style={{ fontSize: "0.65em", color: "var(--text-muted)", marginLeft: 2 }}>
            /100
          </span>
        </span>
      </div>
      <div className="score-track">
        <div
          className="score-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function PassBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="filter-item">
      <span className="filter-name">{label}</span>
      <span className={`badge ${pass ? "badge-pass" : "badge-fail"}`}>
        {pass ? "✓ Pass" : "✗ Fail"}
      </span>
    </div>
  );
}

export default function AdmetPanel({ data }: Props) {
  const solubClass =
    data.solubility_log_mol_l > -3
      ? "badge-pass"
      : data.solubility_log_mol_l > -5
      ? "badge-warn"
      : "badge-fail";

  const saClass =
    data.synthetic_accessibility <= 3
      ? "badge-pass"
      : data.synthetic_accessibility <= 6
      ? "badge-warn"
      : "badge-fail";

  return (
    <div>
      {/* Drug-likeness score */}
      <ScoreBar value={data.drug_likeness_score} label="Drug-likeness score" />

      {/* Ro5 violations callout */}
      {data.ro5_violations > 0 && (
        <div className={`alert-box ${data.ro5_violations === 1 ? "warn" : ""}`}>
          {data.ro5_violations} Lipinski Ro5 violation{data.ro5_violations > 1 ? "s" : ""}
          {data.ro5_violations <= 1 ? " (still acceptable for many scaffolds)" : " — poor oral bioavailability likely"}
        </div>
      )}

      {/* PAINS alerts */}
      {data.pains_alerts.length > 0 && (
        <div className="alert-box" style={{ marginTop: 8 }}>
          PAINS alert{data.pains_alerts.length > 1 ? "s" : ""}:{" "}
          {data.pains_alerts.join(", ")}
        </div>
      )}

      {/* Key physicochemical properties */}
      <div className="prop-grid" style={{ marginTop: 18 }}>
        {[
          { label: "Mol. Weight", value: data.molecular_weight, unit: "Da" },
          { label: "cLogP", value: data.logp, unit: "" },
          { label: "TPSA", value: data.tpsa, unit: "Å²" },
          { label: "HBD", value: data.h_donors, unit: "" },
          { label: "HBA", value: data.h_acceptors, unit: "" },
          { label: "RotBonds", value: data.num_rotatable_bonds, unit: "" },
          { label: "Rings", value: data.num_rings, unit: "" },
          { label: "Arom. Rings", value: data.num_aromatic_rings, unit: "" },
          { label: "Fsp³", value: data.fsp3, unit: "" },
          { label: "Heavy Atoms", value: data.heavy_atom_count, unit: "" },
          { label: "Mol. Refract.", value: data.molar_refractivity, unit: "" },
          { label: "Stereocenters", value: data.num_stereocenters, unit: "" },
        ].map(({ label, value, unit }) => (
          <div className="prop-cell" key={label}>
            <div className="prop-label">{label}</div>
            <div className="prop-value">
              {typeof value === "number" ? value : "—"}
              {unit && <span className="prop-unit">{unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Rule-based filters */}
      <div style={{ marginTop: 20 }}>
        <div className="panel-title" style={{ marginBottom: 10 }}>
          Druglikeness rules
        </div>
        <div className="filter-grid">
          <PassBadge pass={data.ro5_pass} label="Lipinski Ro5" />
          <PassBadge pass={data.veber_pass} label="Veber" />
          <PassBadge pass={data.egan_pass} label="Egan" />
          <PassBadge pass={data.ghose_pass} label="Ghose" />
        </div>
      </div>

      {/* ADMET flags */}
      <div style={{ marginTop: 20 }}>
        <div className="panel-title" style={{ marginBottom: 10 }}>
          ADMET flags
        </div>
        <div className="filter-grid">
          <div className="filter-item">
            <span className="filter-name">BBB</span>
            <span className={`badge ${data.bbb_penetrant ? "badge-pass" : "badge-info"}`}>
              {data.bbb_penetrant ? "Penetrant" : "Non-CNS"}
            </span>
          </div>
          <div className="filter-item">
            <span className="filter-name">hERG</span>
            <span className={`badge ${data.herg_risk ? "badge-fail" : "badge-pass"}`}>
              {data.herg_risk ? "⚠ Risk" : "Low risk"}
            </span>
          </div>
          <div className="filter-item">
            <span className="filter-name">PAINS</span>
            <span className={`badge ${data.num_pains_alerts === 0 ? "badge-pass" : "badge-fail"}`}>
              {data.num_pains_alerts === 0 ? "Clean" : `${data.num_pains_alerts} alert${data.num_pains_alerts > 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="filter-item">
            <span className="filter-name">Solubility</span>
            <span className={`badge ${solubClass}`}>
              {data.solubility_log_mol_l} log
            </span>
          </div>
          <div className="filter-item">
            <span className="filter-name">Synth. Access.</span>
            <span className={`badge ${saClass}`}>
              SA {data.synthetic_accessibility}/10
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}