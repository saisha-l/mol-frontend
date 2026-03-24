type Props = {
    smiles: string | null;
  };
  
  export default function MoleculeViewer({ smiles }: Props) {
    return (
      <div className="card">
        <h2>Molecule Viewer</h2>
        <div className="viewer-box">
          {smiles ? (
            <div>
              <p>
                Viewer placeholder for: <code>{smiles}</code>
              </p>
              <p className="muted">
                Later, replace this with a 2D/3D renderer like 3Dmol.js or a
                chemistry drawing component.
              </p>
            </div>
          ) : (
            <p className="muted">Run a prediction to view the molecule.</p>
          )}
        </div>
      </div>
    );
  }