"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMolblock } from "@/lib/api";

type Props = { smiles: string | null };

export default function MoleculeViewer({ smiles }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<$3Dmol.GLViewer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).$3Dmol) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.4.2/3Dmol-min.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError("Failed to load 3Dmol.js");
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

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
        if (viewerRef.current) viewerRef.current.clear();
        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "0x060b16",
          antialias: true,
        });
        viewer.addModel(molblock, "sdf");
        viewer.setStyle({}, { stick: { radius: 0.13, colorscheme: "Jmol" }, sphere: { scale: 0.28, colorscheme: "Jmol" } });
        viewer.zoomTo();
        viewer.render();
        viewer.zoom(0.82);
        viewer.render();
        viewerRef.current = viewer;
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load 3D structure");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    render();
    return () => { cancelled = true; };
  }, [smiles, scriptLoaded]);

  useEffect(() => {
    function onResize() {
      if (viewerRef.current) { viewerRef.current.resize(); viewerRef.current.render(); }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="viewer-box" style={{ minHeight: 340 }}>
      {!smiles && !loading && (
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          3D structure appears after analysis
        </p>
      )}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(6,11,22,0.85)", borderRadius: 8, zIndex: 10,
        }}>
          <p className="muted" style={{ fontSize: "0.82rem" }}>Generating 3D coordinates…</p>
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
      <div
        ref={containerRef}
        style={{ width: "100%", height: 340, display: smiles ? "block" : "none" }}
      />
    </div>
  );
}