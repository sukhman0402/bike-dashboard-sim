// Engine and gearbox model of the Ducati Panigale V4 S (MY25), driven by the keyboard.
// Sources: functional spec section 3. [Official] values are marked; the rest are fitted or placeholders.
// This file has no imports so it can also run headless (scripts/check-model.ts).

export type PowerMode = "High" | "Medium" | "Low";
export type Gear = number | "N";

// speedKmh is the true road speed. The dash shows it 5% high (see shownKmh).
export type Vehicle = { speedKmh: number; rpm: number; gear: Gear; throttle: number; running: boolean };
export type Controls = { throttle: boolean; brake: boolean; clutch: boolean };
export type Setup = { power: PowerMode; dwc: number | "OFF" };

// Gearing [Official]
const PRIMARY = 1.8;
const FINAL = 41 / 16;
const RATIO = [0, 36 / 15, 34 / 17, 33 / 19, 32 / 21, 30 / 22, 27 / 22];
const WHEEL_CIRC = 2.08; // m, 200/60 ZR17 rolling circumference [Inferred, cross-checked against top speed]
const WHEEL_R = WHEEL_CIRC / (2 * Math.PI);

// Engine
export const IDLE_RPM = 1300; // [Placeholder]
// Shift-up cue: 13,500 rpm at peak power (MY25 owner report; the 2019 Panigale V4 manual gives 13,000) [Inferred].
export const SHIFT_RPM = 13500;
// Rev limiter depends on the gear: "Maximum rpm: 14500 rpm / 15000 rpm (6th gear)" [Official, Panigale V4 and
// Streetfighter V4 S manuals, technical data].
export const limitFor = (gear: Gear) => (gear === 6 ? 15000 : 14500);
// Torque curve: 120.9 Nm at 11,250 and 158.9 kW at 13,500 (112.4 Nm) [Official]; 80% of peak at 6,000 [Official];
// the low and top ends are [Placeholder].
const TORQUE: [number, number][] = [
  [0, 50], [1300, 55], [3000, 72], [6000, 96.7], [9000, 113], [11250, 120.9], [13500, 112.4], [15000, 98], [16000, 90],
];

// Bike and rider [Inferred / fitted]
const MASS = 280; // kg: 187 kg wet without fuel [Official] + fuel + 80 kg rider
const DRIVE_EFF = 0.82; // chain and gearbox losses, fitted to the measured 0 to 100 and 0 to 200 times
const RHO = 1.2;
const CDA = 0.37; // m2, fitted so the bike tops out near 300 km/h
const CRR = 0.015;
const G = 9.81;
const BRAKE_DECEL = 9.3; // m/s2, about 0.95 g with ABS [Placeholder]

// Power modes [Placeholder]: Ducati does not publish the Medium and Low figures.
export const POWER_SCALE: Record<PowerMode, number> = { High: 1, Medium: 0.88, Low: 0.7 };
const THROTTLE_OPEN_S: Record<PowerMode, number> = { High: 0.35, Medium: 0.5, Low: 0.7 }; // twist time, closed to open
const THROTTLE_CLOSE_S = 0.15;
// Pulling away, the clutch slips: the engine runs above the wheel by up to CLUTCH_SLIP_RPM, and the slip fades out
// by CLUTCH_LOCK_KMH. The fade is slower than the wheel speeds the engine up, so the needle only ever climbs
// (Sukhman: the meter used to hold at 7,500 for 1 to 2 s). [Placeholder values]
const CLUTCH_SLIP_RPM: Record<PowerMode, number> = { High: 5500, Medium: 3000, Low: 2500 }; // launch-style in Race
const slipFadeKmh = (slip: number) => slip / 45; // slip fades 45 rpm per km/h while the wheel adds 89 in 1st, so the needle keeps climbing

export const START: Vehicle = { speedKmh: 0, rpm: 0, gear: "N", throttle: 0, running: false };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const approach = (value: number, target: number, maxStep: number) =>
  value < target ? Math.min(target, value + maxStep) : Math.max(target, value - maxStep);

export function torqueAt(rpm: number): number {
  for (let i = 1; i < TORQUE.length; i++) {
    const [r1, t1] = TORQUE[i];
    if (rpm <= r1) {
      const [r0, t0] = TORQUE[i - 1];
      return lerp(t0, t1, (rpm - r0) / (r1 - r0));
    }
  }
  return TORQUE[TORQUE.length - 1][1];
}

const overall = (gear: number) => PRIMARY * RATIO[gear] * FINAL;
export const rpmFor = (speedKmh: number, gear: number) => (speedKmh / 3.6 / WHEEL_CIRC) * 60 * overall(gear);

// Wheelie control caps the forward pull; a higher DWC level intervenes earlier [Placeholder].
const maxAccel = (dwc: Setup["dwc"]) => (dwc === "OFF" ? 9.4 : 9.0 - 0.15 * dwc);

// The dash reads 5% high [Official], so it never shows less than the true speed (UN R39).
export const shownKmh = (v: Vehicle) => Math.round(v.speedKmh * 1.05);

// A gear is refused if it would push the engine past the limiter.
const fits = (gear: number, v: Vehicle) => rpmFor(v.speedKmh, gear) < limitFor(gear);

export function shiftUp(v: Vehicle): Vehicle {
  const next = v.gear === "N" ? 1 : Math.min(6, v.gear + 1);
  return fits(next, v) ? { ...v, gear: next } : v;
}

export function shiftDown(v: Vehicle): Vehicle {
  if (v.gear === "N" || v.gear === 1) return v;
  const next = v.gear - 1;
  return fits(next, v) ? { ...v, gear: next } : v;
}

// Neutral sits between 1st and 2nd on the real gearbox, so it is found from 1st or 2nd only.
export const shiftNeutral = (v: Vehicle): Vehicle => (v.gear === 1 || v.gear === 2 ? { ...v, gear: "N" } : v);

function substep(v: Vehicle, c: Controls, s: Setup, dt: number): Vehicle {
  const throttle = approach(v.throttle, c.throttle && v.running ? 1 : 0, dt / (c.throttle ? THROTTLE_OPEN_S[s.power] : THROTTLE_CLOSE_S));
  const ms = v.speedKmh / 3.6;
  const resist = 0.5 * RHO * CDA * ms * ms + (ms > 0 ? CRR * MASS * G : 0) + (c.brake && ms > 0 ? BRAKE_DECEL * MASS : 0);

  // Engine free of the wheel: neutral, clutch pulled, or engine off.
  const free = v.gear === "N" || c.clutch || !v.running;
  let rpm: number;
  let drive = 0;
  if (free) {
    const target = !v.running ? 0 : throttle > 0.02 ? IDLE_RPM + throttle * (limitFor(v.gear) - IDLE_RPM) : IDLE_RPM;
    rpm = approach(v.rpm, target, (target > v.rpm ? 14000 : 7000) * dt);
  } else {
    const gear = v.gear as number;
    const wheelRpm = rpmFor(v.speedKmh, gear);
    const s0 = CLUTCH_SLIP_RPM[s.power];
    const slip = throttle * s0 * Math.max(0, 1 - v.speedKmh / slipFadeKmh(s0));
    rpm = Math.max(IDLE_RPM, wheelRpm + slip);
    const cut = rpm >= limitFor(gear); // limiter cuts the drive
    const engineTorque = cut ? 0 : throttle * torqueAt(rpm) * POWER_SCALE[s.power] - (1 - throttle) * (8 + 0.0015 * rpm);
    drive = (engineTorque * overall(gear) * DRIVE_EFF) / WHEEL_R;
  }

  let accel = (drive - resist) / MASS;
  accel = Math.min(accel, maxAccel(s.dwc));
  const speedKmh = Math.max(0, (ms + accel * dt) * 3.6);
  if (!free) rpm = Math.max(rpm, rpmFor(speedKmh, v.gear as number));
  return { ...v, throttle, speedKmh, rpm: v.running ? Math.min(rpm, limitFor(v.gear) + 150) : rpm };
}

export function step(v: Vehicle, c: Controls, s: Setup, dt: number): Vehicle {
  const n = Math.max(1, Math.ceil(dt / 0.005));
  let out = v;
  for (let i = 0; i < n; i++) out = substep(out, c, s, dt / n);
  return out;
}
