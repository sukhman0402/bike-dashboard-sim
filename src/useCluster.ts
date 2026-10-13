import { useEffect, useState } from "react";
import { LIVE_DEFAULT, type ClusterState } from "./clusterState";
import { START, shiftDown, shiftNeutral, shiftUp, step, type Vehicle } from "./vehicleModel";

// Keyboard map. Keys are matched by physical position (event.code) so they work on any layout.
export const KEY_MAP = {
  throttle: ["KeyW", "ArrowUp"],
  brake: ["KeyS", "ArrowDown"],
  shiftUp: ["KeyE"],
  shiftDown: ["KeyQ"],
  neutral: ["KeyN"],
} as const;

const HANDLED = new Set<string>(Object.values(KEY_MAP).flat());
const toState = (v: Vehicle): ClusterState => ({ ...LIVE_DEFAULT, speedKmh: Math.round(v.speedKmh), rpm: v.rpm, gear: v.gear });

// Runs the vehicle model from the keyboard. With `frozen` it does nothing: App then shows a static
// design preview instead (used to compare against the Figma reference and to approve new states).
export function useCluster(frozen: boolean): ClusterState {
  const [state, setState] = useState<ClusterState>(() => toState(START));

  useEffect(() => {
    if (frozen) return;
    const held = new Set<string>();
    let v: Vehicle = START;
    let shown = { speed: -1, rpm: -1, gear: v.gear as Vehicle["gear"] };
    let last = performance.now();
    let raf = 0;

    const anyHeld = (codes: readonly string[]) => codes.some((c) => held.has(c));

    const onDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !HANDLED.has(e.code)) return;
      e.preventDefault();
      if (e.repeat) return;
      held.add(e.code);
      if ((KEY_MAP.shiftUp as readonly string[]).includes(e.code)) v = shiftUp(v);
      if ((KEY_MAP.shiftDown as readonly string[]).includes(e.code)) v = shiftDown(v);
      if ((KEY_MAP.neutral as readonly string[]).includes(e.code)) v = shiftNeutral(v);
    };
    const onUp = (e: KeyboardEvent) => held.delete(e.code);
    const onBlur = () => held.clear();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      v = step(v, { throttle: anyHeld(KEY_MAP.throttle), brake: anyHeld(KEY_MAP.brake) }, dt);
      // Re-render only when something visible changed (speed digit, arc by about 0.1%, gear).
      const speed = Math.round(v.speedKmh);
      const rpm = Math.round(v.rpm / 10);
      if (speed !== shown.speed || rpm !== shown.rpm || v.gear !== shown.gear) {
        shown = { speed, rpm, gear: v.gear };
        setState(toState(v));
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

  return state;
}
