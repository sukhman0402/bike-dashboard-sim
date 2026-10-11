import { RPM_MAX } from "./clusterState";

// Scripted motorcycle model. Every number below is a PLACEHOLDER chosen to feel plausible.
// None of it is measured from, or claims to represent, a real motorcycle.
export const IDLE_RPM = 1300;
const LIMITER = 0.97; // rev limiter, as a fraction of RPM_MAX
const GEAR_TOP_KMH = [0, 80, 115, 150, 185, 220, 255]; // speed at RPM_MAX in each gear (index = gear)
const GEAR_ACCEL = [0, 38, 30, 24, 19, 15, 12]; // km/h per s at full throttle and low speed
const ENGINE_BRAKE = 6; // km/h per s with the throttle closed, in gear
const DRAG = 0.0006; // km/h per s per (km/h)^2
const BRAKE = 45; // km/h per s
const COAST_NEUTRAL = 1.5; // km/h per s rolling in neutral
const REV_UP = 9000; // rpm per s, throttle open in neutral
const REV_DOWN = 6000; // rpm per s, throttle closed in neutral
const RPM_FOLLOW = 15000; // rpm per s, how fast the needle chases the engine speed in gear

export type Gear = number | "N";
export type Vehicle = { speedKmh: number; rpm: number; gear: Gear };
export type Controls = { throttle: boolean; brake: boolean };

export const START: Vehicle = { speedKmh: 0, rpm: IDLE_RPM, gear: "N" };

const approach = (value: number, target: number, maxStep: number) =>
  value < target ? Math.min(target, value + maxStep) : Math.max(target, value - maxStep);

const limiterKmh = (gear: number) => GEAR_TOP_KMH[gear] * LIMITER;

// A gear can be engaged only if it would not over-rev the engine.
const canEngage = (gear: number, speedKmh: number) => speedKmh <= limiterKmh(gear);

export function shiftUp(v: Vehicle): Vehicle {
  const next = v.gear === "N" ? 1 : Math.min(6, v.gear + 1);
  return canEngage(next, v.speedKmh) ? { ...v, gear: next } : v;
}

export function shiftDown(v: Vehicle): Vehicle {
  if (v.gear === "N" || v.gear === 1) return v;
  const next = v.gear - 1;
  return canEngage(next, v.speedKmh) ? { ...v, gear: next } : v;
}

export const shiftNeutral = (v: Vehicle): Vehicle => ({ ...v, gear: "N" });

export function step(v: Vehicle, c: Controls, dt: number): Vehicle {
  if (v.gear === "N") {
    const decel = COAST_NEUTRAL + DRAG * v.speedKmh ** 2 + (c.brake ? BRAKE : 0);
    const target = c.throttle ? RPM_MAX * LIMITER : IDLE_RPM;
    const rate = target > v.rpm ? REV_UP : REV_DOWN;
    return {
      ...v,
      speedKmh: Math.max(0, v.speedKmh - decel * dt),
      rpm: approach(v.rpm, target, rate * dt),
    };
  }

  const top = GEAR_TOP_KMH[v.gear];
  const accel = c.throttle ? GEAR_ACCEL[v.gear] * Math.max(0, 1 - (v.speedKmh / top) ** 4) : 0;
  const decel =
    DRAG * v.speedKmh ** 2 + (c.throttle || v.speedKmh === 0 ? 0 : ENGINE_BRAKE) + (c.brake ? BRAKE : 0);
  const speedKmh = Math.min(limiterKmh(v.gear), Math.max(0, v.speedKmh + (accel - decel) * dt));
  const target = Math.max(IDLE_RPM, (speedKmh / top) * RPM_MAX);
  return { ...v, speedKmh, rpm: approach(v.rpm, target, RPM_FOLLOW * dt) };
}
