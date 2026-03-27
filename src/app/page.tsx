"use client";

import { useState } from "react";
import MoleculeViewer from "@/components/MoleculeViewer";
import AdmetPanel from "@/components/AdmetPanel";
import SimilarityTable from "@/components/SimilarityTable";
import TargetsTable from "@/components/TargetsTable";
import {
  fetchAdmet,
  fetchTargets,
  fetchSimilarity,
  AdmetResponse,
  TargetsResponse,
  SimilarityResponse,
} from "@/lib/api";

const EXAMPLES = [
  { label: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
  { label: "Ibuprofen", smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O" },
  { label: "Caffeine", smiles: "Cn1cnc2c1c(=O)n(c(=O)n2C)C" },
  { label: "Sildenafil", smiles: "CCCC1=NN(C2=CC(=C(C=C2)S(=O)(=O)N3CCN(CC3)C)OCC)C(=O)C1" },
];

type Tab = "admet" | "similarity" | "targets";

export default function HomePage() {
  const [smiles, setSmiles] = useState("CC(=O)Oc1ccccc1C(=O)O");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("admet");
  const [analyzed, setAnalyzed] = useState(false);

  const [admet, setAdmet] = useState<AdmetResponse | null>(null);
  const [targets, setTargets] = useState<TargetsResponse | null>(null);
  const [similarity, setSimilarity] = useState<SimilarityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingTargets, setLoadingTargets] = useState(false);
  const [loadingSimilarity, setLoadingSimilarity] = useState(false);

  async function handleAnalyze() {
    if (!smiles.trim()) return;
    setLoading(true);
    setError(null);
    setAdmet(null);
    setTargets(null);
    setSimilarity(null);
    setAnalyzed(false);

    try {
      const admetResult = await fetchAdmet(smiles.trim());
      setAdmet(admetResult);
      setAnalyzed(true);
      setActiveTab("admet");

      // Fire ChEMBL calls in parallel, non-blocking
      setLoadingTargets(true);
      setLoadingSimilarity(true);

      fetchTargets(smiles.trim())
        .then(setTargets)
        .catch(() => setTargets({ smiles, similar_compounds: [], targets: [] }))
        .finally(() => setLoadingTargets(false));

      fetchSimilarity(smiles.trim())
        .then(setSimilarity)
        .catch(() => setSimilarity({ smiles, results: [] }))
        .finally(() => setLoadingSimilarity(false));

    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <h1>// Molecular Discovery Platform</h1>
        <p className="subtitle">
          ADMET profiling · ChEMBL target lookup · Drug similarity search
        </p>
      </header>

      {/* Input panel */}
      <div className="panel">
        <div className="panel-title">Compound Input</div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                className="btn btn-ghost"
                style={{ padding: "5px 12px", fontSize: "0.75rem" }}
                onClick={() => setSmiles(ex.smiles)}
              >
                {ex.label}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={smiles}
            onChange={(e) => setSmiles(e.target.value)}
            placeholder="Enter SMILES string…"
            spellCheck={false}
          />
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading || !smiles.trim()}
          >
            {loading ? "Analyzing…" : "▶ Run Analysis"}
          </button>
        </div>

        {error && (
          <p className="error-text" style={{ marginTop: 12 }}>{error}</p>
        )}
      </div>

      {/* Main results grid */}
      {analyzed && (
        <div className="two-col section-gap">
          {/* Left: 3D viewer */}
          <div className="panel" style={{ padding: 16 }}>
            <div className="panel-title">3D Structure</div>
            <MoleculeViewer smiles={analyzed ? smiles : null} />
            <p className="muted" style={{ marginTop: 8, fontSize: "0.75rem" }}>
              Drag · Scroll · Right-drag to pan
            </p>
          </div>

          {/* Right: Tabbed results */}
          <div className="panel">
            <div className="section-tabs">
              {(["admet", "similarity", "targets"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  className={`section-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "admet" && "ADMET"}
                  {tab === "similarity" && "Similar"}
                  {tab === "targets" && "Targets"}
                </button>
              ))}
            </div>

            {activeTab === "admet" && admet && (
              <AdmetPanel data={admet} />
            )}

            {activeTab === "similarity" && (
              loadingSimilarity ? (
                <div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 38, marginBottom: 8, borderRadius: 6 }} />
                  ))}
                  <p className="muted" style={{ fontSize: "0.8rem", marginTop: 8 }}>
                    Querying ChEMBL similarity…
                  </p>
                </div>
              ) : similarity ? (
                <SimilarityTable compounds={similarity.results} />
              ) : null
            )}

            {activeTab === "targets" && (
              loadingTargets ? (
                <div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 6 }} />
                  ))}
                  <p className="muted" style={{ fontSize: "0.8rem", marginTop: 8 }}>
                    Searching protein targets via ChEMBL…
                  </p>
                </div>
              ) : targets ? (
                <TargetsTable targets={targets.targets} />
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Similarity compounds detail — full width below */}
      {analyzed && targets && !loadingTargets && targets.similar_compounds.length > 0 && (
        <div className="panel section-gap">
          <div className="panel-title">
            Similar ChEMBL Compounds used for target lookup
          </div>
          <SimilarityTable compounds={targets.similar_compounds} />
        </div>
      )}
    </div>
  );
}