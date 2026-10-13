import { FIGMA_DEFAULT, LIVE_DEFAULT, MODE_DEFAULTS, RPM_MAX, type ClusterState } from "./clusterState";

// Static design previews, opened with ?preview=<name>. They exist so each state of the cluster can
// be looked at and approved before the logic behind it is built (docs/functional-spec.md section 9).
// The values are illustrative: rpm comes from the real V4 S gear ratios, nothing else is a model.
const PRIMARY = 1.8;
const FINAL = 41 / 16;
const RATIO = [0, 36 / 15, 34 / 17, 33 / 19, 32 / 21, 30 / 22, 27 / 22];
const CIRC_M = 2.079; // assumed loaded rolling circumference of the 200/60 R17 rear tyre

const rpmAt = (kmh: number, gear: number) =>
  Math.min(RPM_MAX, Math.round(((kmh * 1000) / 60 / CIRC_M) * PRIMARY * RATIO[gear] * FINAL));

const run = (o: Partial<ClusterState>): ClusterState => ({ ...LIVE_DEFAULT, ...o });
const ride = (kmh: number, gear: number, o: Partial<ClusterState> = {}) =>
  run({ speedKmh: kmh, gear, rpm: rpmAt(kmh, gear), lamps: { drl: "on" }, ...o });
const mode = (m: ClusterState["mode"]) => ({ mode: m, levels: MODE_DEFAULTS[m].levels });

export const PREVIEWS: Record<string, ClusterState> = {
  figma: FIGMA_DEFAULT,
  splash: run({ screen: { kind: "splash" } }),
  check: run({ lampTest: true }),
  idle: run({}),
  riding: ride(112, 4),
  stand: run({ lamps: { sidestand: "on" } }),
  turn: ride(34, 2, { turn: { left: true, right: false }, lamps: { drl: "on", highbeam: "on" } }),
  abs: ride(85, 3, { ...mode("RACE B"), message: { icon: "abs", severity: "amber", title: "Rear ABS", subtitle: "Inactive" }, lamps: { drl: "on", abs: "on" } }),
  ice: ride(46, 3, { ambientTempC: 3, message: { icon: "ice", severity: "amber", title: "Ice risk", subtitle: "Below 4 C" } }),
  fuel: ride(96, 4, { message: { icon: "fuel", severity: "amber", title: "Low fuel", subtitle: "Reserve" } }),
  service: ride(70, 3, { message: { icon: "service", severity: "amber", title: "Service", subtitle: "-1000 km" }, lamps: { drl: "on", service: "on" } }),
  fault: ride(60, 3, { message: { icon: "warning", severity: "red", title: "Brake light", subtitle: "Fault", flashing: false }, lamps: { drl: "on", fault: "on" } }),
  params: ride(0, 3, { speedKmh: 0, gear: "N", rpm: 1300, screen: { kind: "params", selected: 0, editing: false } }),
  "params-edit": run({ gear: "N", screen: { kind: "params", selected: 0, editing: true } }),
  modes: run({ gear: "N", screen: { kind: "modes", selected: 2 } }),
  "mode-race": ride(120, 4, { ...mode("RACE A"), message: { icon: "abs", severity: "amber", title: "Rear ABS", subtitle: "Inactive" }, lamps: { drl: "on", abs: "on" } }),
  "mode-wet": ride(58, 3, mode("WET")),
  shift: ride(210, 3, { rpm: 13600, shift: "shift" }),
  limiter: ride(222, 3, { rpm: 15000, shift: "limiter" }),
  // Refined Road Mode 01 (approved information list, docs/road-mode-information.md)
  "r-rest": run({ speedKmh: 112, gear: 4, rpm: rpmAt(112, 4) }),
  "r-fuel": run({ speedKmh: 48, gear: 3, rpm: rpmAt(48, 3), fuelL: 3.4, rangeKm: 40, turn: { left: true, right: false }, message: { icon: "fuel", severity: "amber", title: "Low fuel", subtitle: "On reserve" } }),
  "r-ice": run({ speedKmh: 64, gear: 4, rpm: rpmAt(64, 4), fuelL: 9, rangeKm: 118, ambientTempC: 3, lamps: { highbeam: "on" }, message: { icon: "ice", severity: "amber", title: "Ice risk", subtitle: "Below 4 °C" } }),
  "r-oil": run({ speedKmh: 72, gear: 4, rpm: rpmAt(72, 4), fuelL: 9, rangeKm: 118, lamps: { oil: "on" }, message: { icon: "warning", severity: "red", title: "Oil pressure", subtitle: "Stop engine" } }),
  "r-views": run({ speedKmh: 112, gear: 4, rpm: rpmAt(112, 4), screen: { kind: "views", view: 0 } }),
  "r-check": run({ speedKmh: 0, gear: "N", rpm: 0, lampTest: true }),
  "r-ready": run({ speedKmh: 0, gear: "N", rpm: 1300 }),
};
