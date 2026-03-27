"use client";

import { SimilarCompound } from "@/lib/api";

type Props = {
  compounds: SimilarCompound[];
};

const PHASE_LABEL: Record<number, string> = {
  4: "Approved",
  3: "Phase III",
  2: "Phase II",
  1: "Phase I",
  0: "Preclinical",
};

export default function SimilarityTable({ compounds }: Props) {
  if (compounds.length === 0) {
    return (
      <p className="muted" style={{ fontSize: "0.85rem", padding: "12px 0" }}>
        No similar compounds found in ChEMBL at this threshold.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>ChEMBL ID</th>
            <th>Name</th>
            <th>Similarity</th>
            <th>MW</th>
            <th>cLogP</th>
            <th>Phase</th>
          </tr>
        </thead>
        <tbody>
          {compounds.map((c, i) => {
            const sim = c.similarity ? Math.round(c.similarity) : null;
            const simColor =
              sim && sim >= 85
                ? "var(--green)"
                : sim && sim >= 70
                ? "var(--amber)"
                : "var(--text-muted)";
            const compoundUrl = c.chembl_id
              ? `https://www.ebi.ac.uk/chembl/compound_report_card/${c.chembl_id}/`
              : null;
            return (
              <tr key={c.chembl_id ?? i}>
                <td>
                  {compoundUrl ? (
                    <a
                      className="mono"
                      href={compoundUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--accent)", textDecoration: "none" }}
                    >
                      {c.chembl_id}
                    </a>
                  ) : (
                    <span className="mono dim">—</span>
                  )}
                </td>
                <td style={{ maxWidth: 200 }}>
                  {c.name && c.name !== "—" ? (
                    c.name
                  ) : (
                    <span className="dim">unnamed</span>
                  )}
                  {c.molecule_type && (
                    <div className="dim" style={{ marginTop: 2 }}>
                      {c.molecule_type}
                    </div>
                  )}
                </td>
                <td>
                  <span className="mono" style={{ color: simColor, fontWeight: 600 }}>
                    {sim != null ? `${sim}%` : "—"}
                  </span>
                </td>
                <td className="mono dim">
                  {c.molecular_weight ? `${c.molecular_weight} Da` : "—"}
                </td>
                <td className="mono dim">{c.logp ?? "—"}</td>
                <td>
                  {c.max_phase != null ? (
                    <span
                      className={`badge ${
                        c.max_phase === 4
                          ? "badge-pass"
                          : c.max_phase >= 2
                          ? "badge-warn"
                          : "badge-info"
                      }`}
                    >
                      {PHASE_LABEL[c.max_phase] ?? `Phase ${c.max_phase}`}
                    </span>
                  ) : (
                    <span className="dim">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}