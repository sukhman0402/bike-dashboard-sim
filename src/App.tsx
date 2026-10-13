import { useEffect, useState } from "react";
import { RoadCluster } from "./RoadCluster";
import { useCluster } from "./useCluster";
import { PREVIEWS } from "./previews";

const NATIVE_W = 610;
const NATIVE_H = 225.41;
const CHROME_H = 300; // vertical room kept for the simulation label, start steps, hint line and key groups

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

// Key groups (functional spec section 7). Demo keys trigger events until the riding world exists (Stage 5).
const KEY_GROUPS: { title: string; keys: { keys: string[]; action: string }[] }[] = [
  {
    title: "Ride",
    keys: [
      { keys: ["K"], action: "Ignition" },
      { keys: ["Enter"], action: "Start" },
      { keys: ["W"], action: "Throttle" },
      { keys: ["S"], action: "Brake" },
      { keys: ["Space"], action: "Clutch" },
      { keys: ["E", "Q"], action: "Shift up, down" },
      { keys: ["N"], action: "Neutral" },
      { keys: ["L"], action: "Side stand" },
      { keys: ["X"], action: "Kill switch" },
    ],
  },
  {
    title: "Handlebar",
    keys: [
      { keys: [",", "."], action: "Indicators" },
      { keys: ["H"], action: "Hazard" },
      { keys: ["B"], action: "High beam" },
    ],
  },
  {
    title: "Dash",
    keys: [
      { keys: ["↑", "↓"], action: "Views, scroll" },
      { keys: ["→"], action: "Select" },
      { keys: ["←"], action: "Back" },
      { keys: ["M"], action: "Riding mode" },
    ],
  },
  {
    title: "Demo",
    keys: [
      { keys: ["1"], action: "Ice" },
      { keys: ["2"], action: "Oil pressure" },
      { keys: ["3"], action: "ABS fault" },
      { keys: ["4"], action: "Low fuel" },
      { keys: ["5"], action: "Service" },
    ],
  },
];

export default function App() {
  // ?preview=<name> shows a static design state (see previews.ts); ?state=figma is the Figma frame itself.
  const q = new URLSearchParams(window.location.search);
  const preview = q.get("state") === "figma" ? "figma" : q.get("preview");
  const frozen = preview !== null && preview in PREVIEWS;
  const live = useCluster(frozen);
  const state = frozen ? PREVIEWS[preview!] : live.state;
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
      {!frozen && live.steps && (
        <ol className="start-steps" aria-label="How to start riding">
          {live.steps.map((st, i) => {
            const current = !st.done && live.steps!.slice(0, i).every((x) => x.done);
            return (
              <li key={st.key} className={st.done ? "done" : current ? "now" : undefined}>
                <kbd>{st.key}</kbd>
                {st.label}
              </li>
            );
          })}
        </ol>
      )}
      {!frozen && <p className="sim-hint" role="status">{live.hint}</p>}
      <footer className="key-groups" aria-label="Keyboard controls">
        {KEY_GROUPS.map((g) => (
          <section className="key-group" key={g.title} aria-label={g.title}>
            <h2>{g.title}</h2>
            {g.keys.map(({ keys, action }) => (
              <span className="key-hint" key={action}>
                {keys.map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
                {action}
              </span>
            ))}
          </section>
        ))}
      </footer>
    </main>
  );
}
