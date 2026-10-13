// Headless check of the engine and gearbox model (Stage 2b phase 1).
// Run: node scripts/check-model.ts
// Full throttle from rest in RACE A (High power, DWC 2), shifting up at the shift cue.
import { SHIFT_RPM, START, shiftUp, shownKmh, step, type Setup, type Vehicle } from "../src/vehicleModel.ts";

function run(setup: Setup) {
  let v: Vehicle = shiftUp({ ...START, running: true, rpm: 1300 });
  const dt = 1 / 60;
  let t = 0, t100 = NaN, t200 = NaN, top = 0;
  while (t < 60) {
    v = step(v, { throttle: true, brake: false, clutch: false }, setup, dt);
    t += dt;
    if (v.rpm >= SHIFT_RPM && v.gear !== 6) v = shiftUp(v);
    if (isNaN(t100) && v.speedKmh >= 100) t100 = t;
    if (isNaN(t200) && v.speedKmh >= 200) t200 = t;
    top = Math.max(top, v.speedKmh);
  }
  return { t100, t200, top, shown: shownKmh({ ...v, speedKmh: top }), rpm6: v.rpm };
}

const rows: [string, Setup, (r: ReturnType<typeof run>) => boolean][] = [
  ["RACE A (High, DWC 2)", { power: "High", dwc: 2 }, (r) => r.t100 >= 3.2 && r.t100 <= 3.7 && r.t200 >= 6.8 && r.t200 <= 7.6 && r.top >= 290 && r.top <= 305],
  ["ROAD (Medium, DWC 6)", { power: "Medium", dwc: 6 }, (r) => r.t100 > 3.2],
  ["WET (Low, DWC 6)", { power: "Low", dwc: 6 }, (r) => r.t100 > 3.4],
];
let ok = true;
for (const [name, setup, pass] of rows) {
  const r = run(setup);
  const good = pass(r);
  ok &&= good;
  console.log(`${good ? "PASS" : "FAIL"}  ${name.padEnd(22)} 0-100 ${r.t100.toFixed(2)} s  0-200 ${r.t200.toFixed(2)} s  top ${r.top.toFixed(1)} km/h (shown ${r.shown})  rpm in 6th ${Math.round(r.rpm6)}`);
}
process.exit(ok ? 0 : 1);
