// Everything the bike knows that is not the engine: ignition, start rules, handlebar switches, dash menus,
// trip computer, fuel, temperatures and messages. Pure functions; useCluster feeds it keys and time.
// Timings and thresholds marked [Placeholder] are invented; the rest follow docs/functional-spec.md.
import {
  LIVE_DEFAULT, MODE_DEFAULTS, PARAMS, RIDING_MODES, SHIFT_AT,
  type ClusterState, type DashMessage, type Lamp, type LampId, type Levels, type ParamId, type RidingMode, type Screen,
} from "./clusterState";
import { LIMIT_RPM, POWER_SCALE, SHIFT_RPM, START, shiftDown, shiftNeutral, shiftUp, shownKmh, step, torqueAt, type Vehicle } from "./vehicleModel";

export type Held = { throttle: boolean; brake: boolean; clutch: boolean };
export type Action =
  | "ignition" | "enter" | "kill" | "stand" | "shiftUp" | "shiftDown" | "neutral"
  | "left" | "right" | "hazard" | "highBeam" | "up" | "down" | "back" | "select" | "mode"
  | "demoIce" | "demoOil" | "demoAbs" | "demoFuel" | "demoService";

type Phase = "off" | "splash" | "check" | "ready";
type Faults = { oil: boolean; abs: boolean; service: boolean };

export type Bike = {
  t: number; // seconds since the page opened
  held: Held;
  v: Vehicle;
  phase: Phase;
  phaseT: number;
  kill: boolean; // kill switch in the stop position
  stand: boolean; // side stand down
  turn: "off" | "left" | "right" | "hazard";
  turnKm: number; // distance since the indicator went on
  highBeam: boolean;
  mode: RidingMode;
  levels: Levels;
  screen: Screen;
  menuT: number; // seconds since the last dash button press
  fuelL: number;
  odoKm: number;
  tripKm: number;
  tripS: number;
  tripFuelL: number;
  airC: number;
  coolantC: number;
  faults: Faults;
  since: Partial<Record<string, number>>; // when each message became active (for the red 10 s flash)
  note: { text: string; until: number } | null; // short page hint after a refused action
  rode: boolean; // has the bike moved since the page opened (the start steps hide after that)
};

const SPLASH_S = 1.5; // Ducati logo before the lamp check [Official order, Placeholder time]
const CHECK_S = 2; // all tell-tales lit for 2 s (slide 19)
const MENU_TIMEOUT_S = 10; // [Placeholder]
const MESSAGE_CYCLE_S = 3; // several warnings cycle one every 3 s [Official]
const RED_FLASH_S = 10; // errors flash for 10 s, then hold [Official]
const RESERVE_L = 4; // 17 L tank with 4 L reserve [Official]
const TURN_CANCEL_KM = 0.5; // indicator self-cancel distance [Placeholder]
const ICE_ON_C = 4; // ice warning at 4 C or lower, clears at 6 C [Official]
const ICE_OFF_C = 6;
const BLINK_S = 0.35; // flash half-period [Placeholder]
const RANGE: Record<ParamId, [number, number]> = { dtc: [1, 8], dsc: [1, 3], dwc: [1, 8], ebc: [1, 3], abs: [1, 7] }; // [Placeholder]

export const BIKE_START: Bike = {
  t: 0,
  held: { throttle: false, brake: false, clutch: false },
  v: START,
  phase: "off",
  phaseT: 0,
  kill: false,
  stand: true, // parked on the side stand
  turn: "off",
  turnKm: 0,
  highBeam: false,
  mode: "ROAD",
  levels: MODE_DEFAULTS.ROAD.levels,
  screen: { kind: "off" },
  menuT: 0,
  fuelL: 11.4,
  odoKm: 1248.6,
  tripKm: 118.4,
  tripS: 6120,
  tripFuelL: 8.05,
  airC: 24,
  coolantC: 24, // cold engine
  faults: { oil: false, abs: false, service: false },
  since: {},
  note: null,
  rode: false,
};

const note = (b: Bike, text: string): Bike => ({ ...b, note: { text, until: b.t + 3 } });
const stopEngine = (b: Bike): Bike => ({ ...b, v: { ...b.v, running: false, throttle: 0 } });
const ready = (b: Bike) => b.phase === "ready";
const run: Screen = { kind: "run" };

function startEngine(b: Bike): Bike {
  if (b.v.running) return b;
  if (b.kill) return note(b, "Kill switch is on. Press X to set it to run.");
  if (b.fuelL <= 0) return note(b, "Fuel tank is empty.");
  if (b.v.gear !== "N" && !b.held.clutch) return note(b, "In gear: hold Space (clutch) to start, or select neutral.");
  if (b.v.gear !== "N" && b.stand) return note(b, "Raise the side stand (L) to start in gear.");
  return { ...b, v: { ...b.v, running: true, rpm: 1300 }, note: null };
}

// Dash buttons on the left switchgear. Up and Down cycle the views (one press away) from the main page.
function dash(b: Bike, a: Action): Bike {
  const s = b.screen;
  const t = { ...b, menuT: 0 };
  if (s.kind === "run") {
    if (a === "down") return { ...t, screen: { kind: "views", view: 0 } };
    if (a === "up") return { ...t, screen: { kind: "views", view: 4 } };
    if (a === "select") return { ...t, screen: { kind: "params", selected: 0, editing: false } };
    if (a === "mode") return { ...t, screen: { kind: "modes", selected: RIDING_MODES.indexOf(b.mode) } };
    return b;
  }
  if (s.kind === "views") {
    if (a === "down") return { ...t, screen: s.view === 4 ? run : { kind: "views", view: s.view + 1 } };
    if (a === "up") return { ...t, screen: s.view === 0 ? run : { kind: "views", view: s.view - 1 } };
    if (a === "back") return { ...t, screen: run };
    if (a === "mode") return { ...t, screen: { kind: "modes", selected: RIDING_MODES.indexOf(b.mode) } };
    return b;
  }
  if (s.kind === "params") {
    const p = PARAMS[s.selected];
    if (s.editing) {
      if (a === "up" || a === "down") {
        const lvl = b.levels[p];
        if (lvl === "OFF") return note(t, "A parameter that is Off cannot be changed from the quick menu.");
        const [lo, hi] = RANGE[p];
        const next = Math.min(hi, Math.max(lo, lvl + (a === "up" ? 1 : -1)));
        return { ...t, levels: { ...b.levels, [p]: next } };
      }
      if (a === "select" || a === "back") return { ...t, screen: { ...s, editing: false } };
      return b;
    }
    if (a === "up") return { ...t, screen: { ...s, selected: (s.selected + PARAMS.length - 1) % PARAMS.length } };
    if (a === "down") return { ...t, screen: { ...s, selected: (s.selected + 1) % PARAMS.length } };
    if (a === "select") return { ...t, screen: { ...s, editing: true } };
    if (a === "back") return { ...t, screen: run };
    return b;
  }
  if (s.kind === "modes") {
    const n = RIDING_MODES.length;
    if (a === "up") return { ...t, screen: { kind: "modes", selected: (s.selected + n - 1) % n } };
    if (a === "down") return { ...t, screen: { kind: "modes", selected: (s.selected + 1) % n } };
    if (a === "back" || a === "mode") return { ...t, screen: run };
    if (a === "select") {
      // A riding mode changes with the throttle closed [Official]
      if (b.v.throttle > 0.05) return note(t, "Close the throttle to change the riding mode.");
      const m = RIDING_MODES[s.selected];
      return { ...t, mode: m, levels: MODE_DEFAULTS[m].levels, screen: run };
    }
  }
  return b;
}

export function press(b: Bike, a: Action): Bike {
  if (a === "ignition") {
    if (b.phase !== "off") return { ...stopEngine(b), phase: "off", screen: { kind: "off" }, turn: b.turn === "hazard" ? "hazard" : "off" };
    return { ...b, phase: "splash", phaseT: 0, screen: { kind: "splash" } };
  }
  if (a === "demoIce") return { ...b, airC: b.airC <= ICE_ON_C ? 24 : 3 };
  if (a === "demoOil") return { ...b, faults: { ...b.faults, oil: !b.faults.oil } };
  if (a === "demoAbs") return { ...b, faults: { ...b.faults, abs: !b.faults.abs } };
  if (a === "demoService") return { ...b, faults: { ...b.faults, service: !b.faults.service } };
  if (a === "demoFuel") return { ...b, fuelL: b.fuelL <= RESERVE_L ? 11.4 : 3.6 };
  if (a === "hazard") return { ...b, turn: b.turn === "hazard" ? "off" : "hazard" };
  if (a === "stand") {
    if (!b.stand && b.v.speedKmh > 1) return note(b, "Stop before putting the side stand down.");
    return { ...b, stand: !b.stand };
  }
  if (a === "kill") return { ...(b.kill ? b : stopEngine(b)), kill: !b.kill };
  if (a === "shiftUp") return { ...b, v: shiftUp(b.v) };
  if (a === "shiftDown") return { ...b, v: shiftDown(b.v) };
  if (a === "neutral") return { ...b, v: shiftNeutral(b.v) };
  if (b.phase === "off") return note(b, "Press K to switch the ignition on.");
  if (a === "left") return { ...b, turn: b.turn === "left" ? "off" : "left", turnKm: 0 };
  if (a === "right") return { ...b, turn: b.turn === "right" ? "off" : "right", turnKm: 0 };
  if (a === "highBeam") return { ...b, highBeam: !b.highBeam };
  if (!ready(b)) return b;
  // Enter is the start button while the engine is off, and the dash select button once it runs.
  if (a === "enter") return b.v.running || b.screen.kind !== "run" ? dash(b, "select") : startEngine(b);
  return dash(b, a);
}

// Fuel flow: about 0.9 L/h at idle plus 0.5 L per kWh of engine output [Placeholder, gives roughly 5 to 8 L/100 km].
function fuelLps(v: Vehicle, scale: number) {
  if (!v.running) return 0;
  const kW = (v.throttle * torqueAt(v.rpm) * scale * v.rpm * 2 * Math.PI) / 60 / 1000;
  return (0.9 + 0.5 * kW) / 3600;
}

export function tick(b0: Bike, held: Held, dt: number): Bike {
  let b: Bike = { ...b0, t: b0.t + dt, phaseT: b0.phaseT + dt, menuT: b0.menuT + dt, held };
  if (b.phase === "splash" && b.phaseT >= SPLASH_S) b = { ...b, phase: "check", phaseT: 0, screen: run };
  if (b.phase === "check" && b.phaseT >= CHECK_S) b = { ...b, phase: "ready", phaseT: 0 };
  if (b.screen.kind !== "run" && b.screen.kind !== "off" && b.screen.kind !== "splash" && b.menuT > MENU_TIMEOUT_S) b = { ...b, screen: run };

  // Start rules that stop a running engine [Official]
  if (b.v.running && b.stand && b.v.gear !== "N") b = note(stopEngine(b), "Engine stopped: side stand down while in gear. Press L to raise it.");
  if (b.v.running && b.fuelL <= 0) b = note(stopEngine(b), "Out of fuel.");

  const setup = { power: MODE_DEFAULTS[b.mode].power, dwc: b.levels.dwc };
  const v = step(b.v, held, setup, dt);
  const km = (v.speedKmh * dt) / 3600;
  const fuel = fuelLps(v, POWER_SCALE[setup.power]) * dt;
  const coolTarget = v.running ? 92 : b.airC;
  const turn = (b.turn === "left" || b.turn === "right") && b.turnKm + km >= TURN_CANCEL_KM ? "off" : b.turn;

  // Messages track when they became active, so a red one flashes for its first 10 s.
  const since = { ...b.since };
  for (const id of activeIds(b)) since[id] ??= b.t;
  for (const id of Object.keys(since)) if (id !== "started" && !activeIds(b).includes(id)) delete since[id];

  return {
    ...b,
    v,
    odoKm: b.odoKm + km,
    tripKm: b.tripKm + km,
    tripS: b.tripS + (v.running ? dt : 0),
    tripFuelL: b.tripFuelL + fuel,
    fuelL: Math.max(0, b.fuelL - fuel),
    coolantC: b.coolantC + Math.sign(coolTarget - b.coolantC) * Math.min(Math.abs(coolTarget - b.coolantC), (v.running ? 0.6 : 0.1) * dt),
    turn,
    turnKm: b.turnKm + km,
    since,
    note: b.note && b.note.until > b.t ? b.note : null,
    rode: b.rode || v.speedKmh > 5,
  };
}

// Active warnings, red first [Official display rule; texts are placeholders for Sukhman's review].
const MESSAGES: { id: string; on: (b: Bike) => boolean; m: DashMessage }[] = [
  { id: "oil", on: (b) => b.faults.oil, m: { icon: "warning", severity: "red", title: "Oil pressure", subtitle: "Stop engine" } },
  { id: "absFault", on: (b) => b.faults.abs, m: { icon: "abs", severity: "amber", title: "ABS fault", subtitle: "See dealer" } },
  { id: "rearAbs", on: (b) => b.levels.abs !== "OFF" && b.levels.abs <= 3, m: { icon: "abs", severity: "amber", title: "Rear ABS", subtitle: "Inactive" } },
  { id: "ice", on: (b) => b.airC <= ICE_ON_C || (b.since.ice !== undefined && b.airC < ICE_OFF_C), m: { icon: "ice", severity: "amber", title: "Ice risk", subtitle: "Below 4 °C" } },
  { id: "fuel", on: (b) => b.fuelL <= RESERVE_L, m: { icon: "fuel", severity: "amber", title: "Low fuel", subtitle: "On reserve" } },
  { id: "service", on: (b) => b.faults.service, m: { icon: "service", severity: "amber", title: "Service due", subtitle: "In 1,000 km" } },
];
const activeIds = (b: Bike) => MESSAGES.filter((x) => x.on(b)).map((x) => x.id);

function currentMessage(b: Bike): DashMessage | null {
  const active = MESSAGES.filter((x) => x.on(b));
  const red = active.filter((x) => x.m.severity === "red");
  const pool = red.length ? red : active;
  if (!pool.length) return null;
  const pick = pool[Math.floor(b.t / MESSAGE_CYCLE_S) % pool.length];
  const flashing = pick.m.severity === "red" && b.t - (b.since[pick.id] ?? b.t) < RED_FLASH_S;
  return { ...pick.m, flashing };
}

export function toCluster(b: Bike, clock: string, reducedMotion: boolean): ClusterState {
  const blink = reducedMotion || Math.floor(b.t / BLINK_S) % 2 === 0;
  const on = (x: boolean): Lamp | undefined => (x ? "on" : undefined);
  const lamps: Partial<Record<LampId, Lamp>> = {
    drl: on(b.v.running && !b.highBeam),
    highbeam: on(b.highBeam),
    oil: on(!b.v.running || b.faults.oil), // lit with the ignition on until the engine runs [Official]
    fault: on(b.faults.oil || b.faults.abs),
    abs: on(b.faults.abs),
    service: on(b.faults.service),
    sidestand: on(b.stand),
  };
  const turnOn = b.turn !== "off";
  const avgKmh = b.tripS > 0 ? b.tripKm / (b.tripS / 3600) : 0;
  const avgL100 = b.tripKm > 0.5 ? (b.tripFuelL / b.tripKm) * 100 : 6.8;
  return {
    ...LIVE_DEFAULT,
    speedKmh: shownKmh(b.v),
    rpm: b.v.rpm,
    gear: b.v.gear,
    clock,
    ambientTempC: Math.round(b.airC),
    mode: b.mode,
    fuelL: b.fuelL,
    rangeKm: Math.round((b.fuelL / Math.max(avgL100, 4)) * 100),
    navActive: false,
    trip: { odoKm: b.odoKm, tripKm: b.tripKm, tripS: b.tripS, avgKmh, avgL100 },
    coolantC: Math.round(b.coolantC),
    lamps,
    turn: { left: turnOn && b.turn !== "right", right: turnOn && b.turn !== "left" },
    shift: b.v.rpm >= LIMIT_RPM - 100 ? "limiter" : b.v.rpm >= SHIFT_RPM ? "shift" : "off",
    shiftAt: SHIFT_AT[b.mode],
    shiftHint: shiftHint(b),
    message: b.phase === "ready" ? currentMessage(b) : null,
    levels: b.levels,
    screen: b.screen,
    lampTest: b.phase === "check",
    blink,
    demo: false,
  };
}

// Gear-shift suggestion beside the gear [Placeholder rule]: up at the riding mode's shift point, down when the
// engine labours below 3,000 rpm with the throttle open in 2nd or higher.
function shiftHint(b: Bike): "up" | "down" | null {
  const g = b.v.gear;
  if (!b.v.running || g === "N" || b.v.speedKmh < 3) return null;
  if (g < 6 && b.v.rpm >= SHIFT_AT[b.mode]) return "up";
  if (g >= 2 && b.v.rpm < 3000 && b.held.throttle) return "down";
  return null;
}

// Start steps shown under the cluster until the bike first moves (page chrome, not part of the dash).
export type StartStep = { key: string; label: string; done: boolean };
export function startSteps(b: Bike): StartStep[] | null {
  if (b.rode) return null;
  return [
    { key: "K", label: "Ignition on", done: b.phase !== "off" },
    { key: "Enter", label: "Start engine", done: b.v.running },
    { key: "L", label: "Side stand up", done: !b.stand },
    { key: "E", label: "1st gear", done: b.v.gear !== "N" },
    { key: "W", label: "Hold throttle", done: b.v.speedKmh > 1 },
  ];
}

// One line under the cluster that tells the player what to do next.
export function hintFor(b: Bike): string {
  if (b.note) return b.note.text;
  if (b.phase === "off") return "Press K to switch the ignition on.";
  if (b.phase !== "ready") return "Key-on check.";
  if (!b.v.running) return b.kill ? "Kill switch is on. Press X, then Enter to start." : "Press Enter to start the engine.";
  if (b.v.gear === "N" && b.held.throttle) return "In neutral the engine revs but the bike does not move. Raise the stand (L), then press E for 1st.";
  if (b.stand) return "Raise the side stand with L, then select 1st with E.";
  if (b.v.gear === "N") return "Press E for 1st gear, then hold W.";
  if (shiftHint(b) === "up") return "Shift up now: press E.";
  return "Hold W to ride. E and Q shift, S brakes.";
}
