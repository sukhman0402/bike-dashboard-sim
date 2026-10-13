import { useEffect, useState } from "react";
import { RoadCluster } from "./RoadCluster";
import { useCluster } from "./useCluster";
import { PREVIEWS } from "./previews";

const NATIVE_W = 610;
const NATIVE_H = 225.41;
const CHROME_H = 170; // vertical room kept for the simulation label and the key hints

// Scales the fixed-size cluster to fit the window while keeping its proportions.
function useFitScale(maxScale: number) {
  const calc = () =>
    Math.max(0.1, Math.min(maxScale, (window.innerWidth * 0.94) / NATIVE_W, (window.innerHeight - CHROME_H) / NATIVE_H));
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    const on = () => setScale(calc());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return scale;
}

const KEYS: { keys: string[]; action: string }[] = [
  { keys: ["W", "↑"], action: "Throttle" },
  { keys: ["S", "↓"], action: "Brake" },
  { keys: ["E"], action: "Shift up" },
  { keys: ["Q"], action: "Shift down" },
  { keys: ["N"], action: "Neutral" },
];

export default function App() {
  // ?preview=<name> shows a static design state (see previews.ts); ?state=figma is the Figma frame itself.
  const q = new URLSearchParams(window.location.search);
  const preview = q.get("state") === "figma" ? "figma" : q.get("preview");
  const frozen = preview !== null && preview in PREVIEWS;
  const live = useCluster(frozen);
  const state = frozen ? PREVIEWS[preview!] : live;
  const scale = useFitScale(2.4);
  return (
    <main className="stage">
      <header className="sim-label">
        <span className="sim-badge">Simulation</span>
        <span>All speeds, RPM, fuel, temperatures and warnings are scripted, not real vehicle data.</span>
      </header>
      <div className="cluster-frame" style={{ width: NATIVE_W * scale, height: NATIVE_H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <RoadCluster state={state} />
        </div>
      </div>
      <footer className="key-hints" aria-label="Keyboard controls">
        {KEYS.map(({ keys, action }) => (
          <span className="key-hint" key={action}>
            {keys.map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
            {action}
          </span>
        ))}
      </footer>
    </main>
  );
}
