import { useEffect, useState } from "react";
import { RoadCluster } from "./RoadCluster";
import { FIGMA_DEFAULT } from "./clusterState";

const NATIVE_W = 610;
const NATIVE_H = 225.41;

// Scales the fixed-size cluster to fit the window while keeping its proportions.
function useFitScale(maxScale: number) {
  const calc = () => Math.min(maxScale, (window.innerWidth * 0.94) / NATIVE_W, (window.innerHeight * 0.9) / NATIVE_H);
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    const on = () => setScale(calc());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  });
  return scale;
}

export default function App() {
  const scale = useFitScale(2.4);
  return (
    <main className="stage">
      <div style={{ width: NATIVE_W * scale, height: NATIVE_H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <RoadCluster state={FIGMA_DEFAULT} />
        </div>
      </div>
    </main>
  );
}
