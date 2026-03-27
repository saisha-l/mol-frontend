"use client";

import { TargetResult } from "@/lib/api";

type Props = {
  targets: TargetResult[];
};

export default function TargetsTable({ targets }: Props) {
  if (targets.length === 0) {
    return (
      <p className="muted" style={{ fontSize: "0.85rem", padding: "12px 0" }}>
        No protein targets found. Try lowering the similarity threshold.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Target</th>
            <th>Organism</th>
            <th>Activity</th>
            <th>Value</th>
            <th>Via compound</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((t, i) => (
            <tr key={t.target_chembl_id ?? i}>
              <td>
                {t.target_chembl_id ? (
                  <a
                    href={`https://www.ebi.ac.uk/chembl/target_report_card/${t.target_chembl_id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--teal)", textDecoration: "none", fontWeight: 500 }}
                  >
                    {t.target_name}
                  </a>
                ) : (
                  <span>{t.target_name}</span>
                )}
                <div className="dim mono" style={{ marginTop: 2, fontSize: "0.72rem" }}>
                  {t.target_chembl_id || "—"}
                </div>
              </td>
              <td className="dim" style={{ fontSize: "0.82rem" }}>
                {t.organism ?? "—"}
              </td>
              <td>
                {t.standard_type ? (
                  <span className="badge badge-info">{t.standard_type}</span>
                ) : (
                  <span className="dim">—</span>
                )}
              </td>
              <td className="mono dim">
                {t.standard_value != null
                  ? `${t.standard_value} ${t.standard_units ?? ""}`
                  : "—"}
              </td>
              <td>
                {t.found_via.length > 0 ? (
                  <a
                    href={`https://www.ebi.ac.uk/chembl/compound_report_card/${t.found_via[0]}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono"
                    style={{ color: "var(--accent)", textDecoration: "none", fontSize: "0.78rem" }}
                  >
                    {t.similar_compound_name && t.similar_compound_name !== "—"
                      ? t.similar_compound_name
                      : t.found_via[0]}
                  </a>
                ) : (
                  <span className="dim">—</span>
                )}
                {t.found_via.length > 1 && (
                  <span className="dim" style={{ fontSize: "0.72rem", marginLeft: 4 }}>
                    +{t.found_via.length - 1}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}