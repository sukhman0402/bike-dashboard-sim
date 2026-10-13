import { useEffect, useState } from "react";
import { LIVE_DEFAULT, type ClusterState } from "./clusterState";
import { BIKE_START, hintFor, press, startSteps, tick, toCluster, type Action, type Bike, type Held, type StartStep } from "./bikeState";

// Keyboard map, functional spec section 7. Keys are matched by physical position (event.code) so they work on any layout.
const HOLD: Record<string, keyof Held> = { KeyW: "throttle", KeyS: "brake", Space: "clutch" };
const PRESS: Record<string, Action> = {
  KeyK: "ignition", Enter: "enter", KeyX: "kill", KeyL: "stand",
  KeyE: "shiftUp", KeyQ: "shiftDown", KeyN: "neutral",
  Comma: "left", Period: "right", KeyH: "hazard", KeyB: "highBeam",
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "back", ArrowRight: "select", KeyM: "mode",
  Digit1: "demoIce", Digit2: "demoOil", Digit3: "demoAbs", Digit4: "demoFuel", Digit5: "demoService",
};

// Device time in the Figma style, "09:16 A.M."
function clockText(d = new Date()) {
  const h = d.getHours();
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "A.M." : "P.M."}`;
}

export type Live = { state: ClusterState; hint: string; steps: StartStep[] | null };

// Runs the bike from the keyboard. With `frozen` it does nothing: App then shows a static design preview
// instead (used to compare against the Figma reference and to approve new states).
export function useCluster(frozen: boolean): Live {
  const [live, setLive] = useState<Live>(() => ({ state: { ...LIVE_DEFAULT, screen: { kind: "off" } }, hint: hintFor(BIKE_START), steps: startSteps(BIKE_START) }));

  useEffect(() => {
    if (frozen) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const held: Held = { throttle: false, brake: false, clutch: false };
    let b: Bike = BIKE_START;
    let shown = "";
    let last = performance.now();
    let raf = 0;

    const onDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const hold = HOLD[e.code];
      const action = PRESS[e.code];
      if (!hold && !action) return;
      e.preventDefault();
      if (hold) held[hold] = true;
      if (action && !e.repeat) b = press({ ...b, held: { ...held } }, action); // press sees the keys held right now
    };
    const onUp = (e: KeyboardEvent) => {
      const hold = HOLD[e.code];
      if (hold) held[hold] = false;
    };
    const onBlur = () => Object.assign(held, { throttle: false, brake: false, clutch: false });

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      b = tick(b, { ...held }, dt);
      // Inside an embedded preview the page only hears keys once it has focus.
      const hint = document.hasFocus() ? hintFor(b) : "Click the page once so it can read your keys.";
      const next = { state: toCluster(b, clockText(), reduced.matches), hint, steps: startSteps(b) };
      // Re-render only when something visible changed (the arc is compared to the nearest 10 rpm).
      const key = JSON.stringify({ ...next, state: { ...next.state, rpm: Math.round(next.state.rpm / 10) } });
      if (key !== shown) {
        shown = key;
        setLive(next);
      }
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [frozen]);

  return live;
}
