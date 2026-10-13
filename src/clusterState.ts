// Everything the Road cluster can display. The Figma frame (slide 31, "Road Mode- 01") shows all
// tell-tales lit and a "Rear ABS Inactive" message only to demonstrate placement. In use they are
// off until their event happens (functional spec section 4), so the live default has none lit.
export type RidingMode = "RACE A" | "RACE B" | "SPORT" | "ROAD" | "WET";
export const RIDING_MODES: RidingMode[] = ["RACE A", "RACE B", "SPORT", "ROAD", "WET"];

export type Lamp = "off" | "on" | "flash";
export type LampId = "drl" | "fault" | "abs" | "service" | "mil" | "sidestand" | "highbeam" | "oil" | "coolant";

export type Severity = "amber" | "red";
export type MessageIcon = "abs" | "warning" | "service" | "ice" | "fuel";
export type DashMessage = { icon: MessageIcon; severity: Severity; title: string; subtitle?: string; flashing?: boolean };

export type ParamId = "dtc" | "dsc" | "dwc" | "ebc" | "abs";
export const PARAMS: ParamId[] = ["dtc", "dsc", "dwc", "ebc", "abs"];
export type Levels = Record<ParamId, number | "OFF">;

export type Screen =
  | { kind: "off" } // ignition off: the display is dark
  | { kind: "run" }
  | { kind: "splash" }
  | { kind: "params"; selected: number; editing: boolean }
  | { kind: "modes"; selected: number }
  | { kind: "views"; view: number }; // one press away: Trip, Odometer, Temperatures, Rider aids, Navigation

export type ShiftState = "off" | "shift" | "limiter";

// Trip computer (Road trip info: Total, Trip, average speed, trip time, consumption) [Official item list].
export type Trip = { odoKm: number; tripKm: number; tripS: number; avgKmh: number; avgL100: number };

export type ClusterState = {
  speedKmh: number;
  rpm: number;
  gear: number | "N";
  clock: string;
  ambientTempC: number;
  mode: RidingMode;
  fuelL: number; // 17 L tank including a 4 L reserve (Ducati)
  rangeKm: number;
  navActive: boolean; // the location pin shows only while navigation is running
  trip: Trip;
  coolantC: number;
  lamps: Partial<Record<LampId, Lamp>>;
  turn: { left: boolean; right: boolean };
  shift: ShiftState;
  shiftAt: number; // suggested upshift rpm for the riding mode, drawn as the shift zone on the scale [Placeholder]
  shiftHint: "up" | "down" | null; // gear-shift suggestion beside the gear
  message: DashMessage | null;
  levels: Levels;
  screen: Screen;
  lampTest: boolean; // key-on lamp check: every tell-tale lit
  blink: boolean; // current phase of anything flashing; held true under prefers-reduced-motion
  demo: boolean; // Figma placement art (oil and coolant drawn orange). The standards colour is red.
};

// Full-scale of the RPM arc (the Figma Race screen scale is 1 to 16, x1000). UNVERIFIED: Ducati does
// not publish the V4 S limit. See docs/functional-spec.md section 8.
export const RPM_MAX = 16000;

// Riding mode defaults for the V4 S, MY25 owner's manual (functional spec section 5).
// Suggested upshift rpm per riding mode [Placeholder]: an easy commute point in Road and Wet, near peak power in
// Sport and Race. The best-acceleration point is close to the limiter, which the white shift cue at 13,500 marks.
export const SHIFT_AT: Record<RidingMode, number> = { "RACE A": 13500, "RACE B": 13500, SPORT: 11000, ROAD: 9000, WET: 7500 };

export const MODE_DEFAULTS: Record<RidingMode, { power: "High" | "Medium" | "Low"; levels: Levels }> = {
  "RACE A": { power: "High", levels: { dtc: 2, dsc: 1, dwc: 2, ebc: 2, abs: 1 } },
  "RACE B": { power: "High", levels: { dtc: 3, dsc: 2, dwc: 3, ebc: 2, abs: 3 } },
  SPORT: { power: "Medium", levels: { dtc: 5, dsc: 2, dwc: 5, ebc: 2, abs: 6 } },
  ROAD: { power: "Medium", levels: { dtc: 6, dsc: 2, dwc: 6, ebc: 3, abs: 6 } },
  WET: { power: "Low", levels: { dtc: 8, dsc: 2, dwc: 6, ebc: 3, abs: 7 } },
};

// Live default: engine at rest, nothing lit, no message.
export const LIVE_DEFAULT: ClusterState = {
  speedKmh: 0,
  rpm: 1300,
  gear: "N",
  clock: "09:16 A.M.",
  ambientTempC: 24,
  mode: "ROAD",
  fuelL: 11.4,
  rangeKm: 150,
  navActive: false,
  trip: { odoKm: 1248.6, tripKm: 118.4, tripS: 6120, avgKmh: 46, avgL100: 6.8 }, // example values for previews
  coolantC: 90,
  lamps: {},
  turn: { left: false, right: false },
  shift: "off",
  shiftAt: 9000,
  shiftHint: null,
  message: null,
  levels: MODE_DEFAULTS.ROAD.levels,
  screen: { kind: "run" },
  lampTest: false,
  blink: true,
  demo: false,
};

// Values exactly as drawn in the Figma frame, tell-tales lit for placement. The Figma arc is filled
// to 80.2%, so rpm matches the art (12,830 of 16,000). That does not agree with the vehicle model.
export const FIGMA_DEFAULT: ClusterState = {
  ...LIVE_DEFAULT,
  speedKmh: 56,
  rpm: 12830,
  gear: 3,
  fuelL: 10.6, // five of eight segments, as drawn
  rangeKm: 140,
  navActive: true, // the frame shows the location pin
  lamps: { drl: "on", fault: "on", abs: "on", service: "on", oil: "on", coolant: "on" },
  message: { icon: "abs", severity: "amber", title: "Rear ABS", subtitle: "Inactive" },
  demo: true,
};
