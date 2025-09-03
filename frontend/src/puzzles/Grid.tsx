import Canvas from "../components/Canvas";

function GridPuzzle() {
  return (
    <div
      className="d-grid"
      style={{
        minWidth: 800,
        minHeight: 600,
      }}
    >
      <Canvas className="mx-auto w-full"></Canvas>
    </div>
  );
}

export default GridPuzzle;
