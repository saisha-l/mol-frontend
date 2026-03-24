"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMolblock } from "@/lib/api";

type Props = {
  smiles: string | null;
};

export default function MoleculeViewer({ smiles }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<$3Dmol.GLViewer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load 3Dmol.js script once
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).$3Dmol) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.4.2/3Dmol-min.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError("Failed to load 3Dmol.js library");
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // Render molecule when smiles changes or script loads
  useEffect(() => {
    if (!smiles || !scriptLoaded || !containerRef.current) return;

    const $3Dmol = (window as any).$3Dmol;
    if (!$3Dmol) return;

    let cancelled = false;

    async function render() {
      setLoading(true);
      setError(null);

      try {
        const { molblock } = await fetchMolblock(smiles!);

        if (cancelled) return;

        // Clear any existing viewer
        if (viewerRef.current) {
          viewerRef.current.clear();
        }

        // Create viewer
        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "0x0d1427",
          antialias: true,
        });

        viewer.addModel(molblock, "sdf");
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.3 } });
        viewer.zoomTo();
        viewer.render();
        viewer.zoom(0.85);
        viewer.render();

        viewerRef.current = viewer;
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load 3D structure"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [smiles, scriptLoaded]);

  // Handle resize
  useEffect(() => {
    function handleResize() {
      if (viewerRef.current) {
        viewerRef.current.resize();
        viewerRef.current.render();
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="card">
      <h2>Molecule Viewer</h2>
      <div
        className="viewer-box"
        style={{ position: "relative", minHeight: 350 }}
      >
        {!smiles && !loading && (
          <p className="muted">Run a prediction to view the molecule in 3D.</p>
        )}

        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              background: "rgba(13, 20, 39, 0.8)",
              borderRadius: 12,
            }}
          >
            <p className="muted">Generating 3D coordinates...</p>
          </div>
        )}

        {error && (
          <p className="error">{error}</p>
        )}

        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: 350,
            display: smiles ? "block" : "none",
          }}
        />
      </div>

      {smiles && !loading && !error && (
        <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
          Drag to rotate · Scroll to zoom · Right-drag to pan
        </p>
      )}
    </div>
  );
}