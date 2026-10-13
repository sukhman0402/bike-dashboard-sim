import type { CSSProperties } from "react";
import {
  MODE_DEFAULTS,
  PARAMS,
  RIDING_MODES,
  RPM_MAX,
  type ClusterState,
  type DashMessage,
  type Lamp,
  type LampId,
  type ParamId,
  type RidingMode,
} from "./clusterState";
import "./cluster.css";

import abs from "./assets/cluster/abs.svg";
import warning from "./assets/cluster/warning.svg";
import warningRed from "./assets/cluster/warning-red.svg";
import wrench from "./assets/cluster/wrench.svg";
import fuelPump from "./assets/cluster/fuel-pump.svg";
import tempBar from "./assets/cluster/temp-bar.svg";
import coolantOrange from "./assets/cluster/coolant.svg";
import coolantRed from "./assets/cluster/coolant-red.svg";
import oilCanOrange from "./assets/cluster/temperature.svg"; // the file is misnamed: it is the oil can
import oilCanRed from "./assets/cluster/oil-can-red.svg";
import statusOk from "./assets/cluster/status-ok.svg";
import location from "./assets/cluster/location.svg";
import scrollLeft from "./assets/cluster/scroll-left.svg";
import scrollRight from "./assets/cluster/scroll-right.svg";
import drl from "./assets/cluster/drl-a.png";
import arrows from "./assets/cluster/arrows.png";
import ducatiLogo from "./assets/cluster/ducati-logo.png";
import highBeam from "./assets/cluster/high-beam.svg";
import engine from "./assets/cluster/engine.svg";
import sideStand from "./assets/cluster/side-stand.svg";
import snowflake from "./assets/cluster/snowflake.svg";
import fuelPumpAmber from "./assets/cluster/fuel-pump-amber.svg";

// RPM arc. Same centre (96, 95.15), radius (80.62 to the band middle), thickness (14.76) and gradient as the
// Figma paths, now drawn as a stroke so both ends of the arc are round (Sukhman's change); the moving fill edge is square. The sweep is 240 deg instead of
// 247 deg so the round caps stay inside the original band. Markings: the band is cut into equal 2,000 rpm
// segments and each cut has its numeral just outside the arc (Sukhman: divisions must match the numbers).
const ARC_BOX = { left: 305.66, top: 7.49, width: 189.78, height: 143.7, transform: "translateX(-50%)" } as const;
const AC = { x: 96, y: 95.15 };
const RM = 80.62;
const BW = 14.76;
const RN = RM + BW / 2 + 5.5; // numeral radius, just outside the band (where the dotted ring was)
const RT = RM - BW / 2 - 1.2; // outer edge of the tick ring, just inside the band
const RED_FROM = 15000; // red zone start (functional spec section 8, unverified)
const SHIFT_AMBER = "#FFBF00"; // shift zone and shift arrow [Placeholder colour, same amber as the menu highlight]
const A0 = -120;
const A1 = 120;
const xy = (deg: number, r: number): [number, number] => {
  const t = (deg * Math.PI) / 180;
  return [AC.x + r * Math.sin(t), AC.y - r * Math.cos(t)];
};
const arcD = (a0: number, a1: number, r = RM) => {
  const [x0, y0] = xy(a0, r);
  const [x1, y1] = xy(a1, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const rpmDeg = (rpm: number) => A0 + (A1 - A0) * Math.min(1, Math.max(0, rpm / RPM_MAX));

function RpmArc({ rpm, shift, limiter, blink, shiftAt }: { rpm: number; shift: boolean; limiter: boolean; blink: boolean; shiftAt: number }) {
  const end = rpmDeg(rpm);
  const white = shift && blink && !limiter;
  const fill = limiter ? "#FF2A1F" : white ? "#FFFFFF" : "url(#rpm-grad)";
  return (
    <svg className="a" viewBox="0 0 190 144" style={{ ...ARC_BOX, overflow: "visible" }} aria-hidden="true">
      <defs>
        <linearGradient id="rpm-grad" gradientUnits="userSpaceOnUse" x1="177.031" y1="49.128" x2="14.9678" y2="141.164">
          <stop stopColor="#C90203" />
          <stop offset="1" stopColor="#630102" />
        </linearGradient>
      </defs>
      <path d={arcD(A0, A1)} stroke="#3F3F3F" strokeWidth={BW} strokeLinecap="round" fill="none" />
      {/* the fill starts with the arc's round cap and ends square, so its edge reads the exact rpm and never covers a numeral */}
      {rpm > 0 && <circle cx={xy(A0, RM)[0]} cy={xy(A0, RM)[1]} r={BW / 2} fill={fill} />}
      {rpm > 0 && <path d={arcD(A0, Math.max(end, A0 + 0.01))} stroke={fill} strokeWidth={BW} strokeLinecap="butt" fill="none" />}
      {/* divisions: equal 2,000 rpm segments, each cut lines up with its numeral (outside the arc) */}
      {Array.from({ length: 7 }, (_, i) => {
        const a = rpmDeg((i + 1) * 2000);
        const [x0, y0] = xy(a, RM - BW / 2 - 0.5);
        const [x1, y1] = xy(a, RM + BW / 2 + 0.5);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#000" strokeWidth={1.4} />;
      })}
      {/* scale ring inside the band (detail from the Ducati Scrambler dial): a fine tick every 500 rpm, a longer
          one every 1,000, red in the red zone (15,000 to 16,000, functional spec section 8, unverified) */}
      {/* shift zone: amber from the riding mode's suggested upshift point to the red zone (Sukhman: show the right rpm to shift) */}
      <path d={arcD(rpmDeg(shiftAt), rpmDeg(RED_FROM), RT)} stroke={SHIFT_AMBER} strokeWidth={1.3} fill="none" />
      <path d={arcD(rpmDeg(RED_FROM), A1, RT)} stroke="#CC0000" strokeWidth={1.3} fill="none" />
      {Array.from({ length: RPM_MAX / 500 + 1 }, (_, i) => {
        const r = i * 500;
        const major = r % 1000 === 0;
        const a = rpmDeg(r);
        const [x0, y0] = xy(a, RT);
        const [x1, y1] = xy(a, RT - (major ? 4.2 : 2.4));
        const color = r >= RED_FROM ? "#FF2A1F" : r >= shiftAt ? SHIFT_AMBER : major ? "#FFFFFF" : "#8C8C8C";
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={major ? 0.9 : 0.6} />;
      })}
      {Array.from({ length: 9 }, (_, i) => {
        const [x, y] = xy(rpmDeg(i * 2000), RN);
        return (
          <text key={i} x={x} y={y} className="rpm-n" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central">
            {i * 2}
          </text>
        );
      })}
      {/* pointer at the end of the wake (official: pointer plus filled wake), across the band and the scale ring */}
      {rpm > 0 && (() => {
        const [x0, y0] = xy(end, RT - 4.2);
        const [x1, y1] = xy(end, RM + BW / 2);
        return <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={white ? "#CC0000" : "#FFFFFF"} strokeWidth={1.8} strokeLinecap="round" />;
      })()}
    </svg>
  );
}

type Box = { left: number; top: number; width: number; height: number };

// Tell-tales. Positions are from the Figma frame; the three marked isNew have no Figma position, so
// they sit in free space (placeholder, for approval). Colours: functional spec section 4.
const LAMPS: { id: LampId; src: string; box: Box }[] = [
  // Refined: one centre line (y 206) and an even 28 px pitch. The Figma icons sat on slightly different lines and gaps.
  { id: "fault", src: warning, box: { left: 80, top: 197.28, width: 24.02, height: 17.44 } },
  { id: "abs", src: abs, box: { left: 108, top: 197.28, width: 24.02, height: 17.44 } },
  { id: "service", src: wrench, box: { left: 136.5, top: 196.5, width: 23, height: 19 } },
  { id: "mil", src: engine, box: { left: 164, top: 197, width: 24, height: 18 } }, // isNew
  { id: "sidestand", src: sideStand, box: { left: 193, top: 197, width: 22, height: 18 } }, // isNew
  { id: "oil", src: oilCanRed, box: { left: 492.49, top: 203.33, width: 25.58, height: 11.37 } },
  { id: "coolant", src: coolantRed, box: { left: 526.73, top: 197.68, width: 67.45, height: 16.95 } },
];

const STATUS_OK: { title: string; subtitle?: string } = { title: "Systems OK", subtitle: "Ride safe" }; // Sukhman picked option B

const MESSAGE_ICON: Record<DashMessage["icon"], string> = { abs, warning, service: wrench, ice: snowflake, fuel: fuelPumpAmber };

// Riding mode name background colours (the manual gives each mode its own colour but not the value).
// Placeholder. ROAD stays plain white text as in the Figma frame.
const PILL: CSSProperties = { padding: "0 7px", borderRadius: 4 };
const MODE_STYLE: Record<RidingMode, CSSProperties | undefined> = {
  "RACE A": { background: "#D0021B", color: "#fff", ...PILL },
  "RACE B": { background: "#FF7A00", color: "#000", ...PILL },
  SPORT: { background: "#FFD400", color: "#000", ...PILL },
  ROAD: undefined,
  WET: { background: "#2F7BFF", color: "#fff", ...PILL },
};
const MODE_ACCENT: Record<RidingMode, string> = { "RACE A": "#FF3B4A", "RACE B": "#FF7A00", SPORT: "#FFD400", ROAD: "#FFFFFF", WET: "#5C9BFF" };

const PARAM_LABEL: Record<ParamId, string> = { dtc: "DTC", dsc: "DSC", dwc: "DWC", ebc: "EBC", abs: "ABS" };
// Row colours follow the Race screen in the case study (slide 30).
const PARAM_COLOR: Record<ParamId, string> = { dtc: "#FFBF00", dsc: "#34D14A", dwc: "#FFBF00", ebc: "#29C5F6", abs: "#D9D9D9" };

function lampOpacity(value: Lamp | undefined, blink: boolean, test: boolean) {
  if (test || value === "on") return 1;
  if (value === "flash") return blink ? 1 : 0;
  return 0;
}

function Message({ m, blink }: { m: DashMessage; blink: boolean }) {
  const icon = m.icon === "warning" && m.severity === "red" ? warningRed : MESSAGE_ICON[m.icon];
  const hidden = m.flashing && !blink;
  return (
    <div style={{ opacity: hidden ? 0 : 1 }}>
      <img className="a" src={icon} alt="" style={m.icon === "abs" || m.icon === "warning" ? { left: 102.2, top: 68, width: 24.02, height: 17.44 } : { left: 98.6, top: 65.4, width: 31.2, height: 22.7, objectFit: "contain" }} />
      <p className="t t-msg1">{m.title}</p>
      {m.subtitle && <p className="t t-msg2">{m.subtitle}</p>}
    </div>
  );
}

function ParamPanel({ state }: { state: ClusterState }) {
  const s = state.screen.kind === "params" ? state.screen : null;
  return (
    <div className="panel" style={{ left: 44, top: 51 }}>
      {PARAMS.map((p, i) => {
        const sel = s?.selected === i;
        return (
          <div className={`row${sel ? " sel" : ""}${sel && s?.editing ? " edit" : ""}`} key={p}>
            <span className="lab">{PARAM_LABEL[p]}</span>
            <span className="lvl">{state.levels[p]}</span>
            <span className="bar" style={{ background: PARAM_COLOR[p] }} />
          </div>
        );
      })}
    </div>
  );
}

function ModePanel({ state }: { state: ClusterState }) {
  const selected = state.screen.kind === "modes" ? state.screen.selected : 0;
  return (
    <div className="panel" style={{ left: 44, top: 51 }}>
      {RIDING_MODES.map((m, i) => (
        <div className={`row${i === selected ? " sel" : ""}`} key={m} style={{ ["--accent" as string]: MODE_ACCENT[m] }}>
          <span className="lab">{m}</span>
          <span className="power">{MODE_DEFAULTS[m].power}</span>
        </div>
      ))}
    </div>
  );
}

// One press away (approved list): the views open in the left block, the same place messages use.
const VIEWS = ["Trip", "Odometer", "Temperatures", "Rider aids", "Navigation"];
const hm = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}`;
function viewRows(state: ClusterState, view: number): [string, string, string][] {
  const t = state.trip;
  switch (view) {
    case 0: return [["Distance", t.tripKm.toFixed(1), "km"], ["Average", String(Math.round(t.avgKmh)), "km/h"], ["Time", hm(t.tripS), "h"]];
    case 1: return [["Total", Math.floor(t.odoKm).toLocaleString("en-GB"), "km"], ["Average use", t.avgL100.toFixed(1), "L/100 km"]];
    case 2: return [["Air", String(state.ambientTempC), "°C"], ["Coolant", String(state.coolantC), "°C"]];
    case 3: return [["DTC", String(state.levels.dtc), ""], ["DWC", String(state.levels.dwc), ""], ["ABS", String(state.levels.abs), ""]];
    default: return [["Route", "None", ""], ["Phone", "Not paired", ""]];
  }
}
function ViewsPanel({ state, view }: { state: ClusterState; view: number }) {
  return (
    <div className="views" style={{ left: 40, top: 60 }}>
      <p className="v-title">{VIEWS[view]}</p>
      {viewRows(state, view).map(([l, v, u]) => (
        <p className="v-row" key={l}><span className="v-lab">{l}</span><span className="v-val">{v}{u && <small>{u}</small>}</span></p>
      ))}
      <p className="v-dots">{VIEWS.map((n, i) => <i key={n} className={i === view ? "on" : undefined} />)}</p>
    </div>
  );
}

// Source: Figma file 7h8baVVBXfCwBsWUUHjD3N, node 1:52565 "Road Mode- 01" (slide 31, Interface 03).
// Native size 610 x 225.4 px. Every Figma element sits at the position and size taken from the frame.
export function RoadCluster({ state }: { state: ClusterState }) {
  if (state.screen.kind === "off") return <div className="cluster" role="img" aria-label="Simulated instrument panel, ignition off" />;
  if (state.screen.kind === "splash") {
    return (
      <div className="cluster" role="img" aria-label="Simulated instrument panel starting">
        <img className="a" src={ducatiLogo} alt="" style={{ left: 305, top: 112.7, width: 190, transform: "translate(-50%, -50%)" }} />
      </div>
    );
  }

  const s = state.screen;
  const test = state.lampTest;
  const neutral = state.gear === "N" || test;
  const limiter = state.shift === "limiter";
  // Headlight slot: high beam (blue) and DRL (green) share one place and never show together (Sukhman's change).
  const highOn = test || state.lamps.highbeam === "on";
  const drlOn = !highOn && state.lamps.drl === "on";
  const turnLit = (on: boolean) => ({ opacity: test || (on && state.blink) ? 1 : 0 });
  // A red (critical) message overrides secondary visuals (slide 20): air, clock, fuel and range dim.
  const dim = s.kind === "run" && state.message?.severity === "red" ? { opacity: 0.35 } : undefined;
  const lowFuel = state.fuelL <= 4;
  const fuelSegs = Math.max(1, Math.round((state.fuelL / 17) * 8));

  return (
    <div className="cluster" role="img" aria-label={`Simulated ${state.mode} mode, ${state.speedKmh} kilometres per hour, gear ${state.gear}`}>
      {/* top row */}
      <p className={`t t-air${state.ambientTempC <= 4 ? " warn" : ""}`} style={dim}>Air {state.ambientTempC} °C</p>
      {state.navActive && <img className="a" src={location} alt="" style={{ left: 495.55, top: 11.55, width: 10.5, height: 12.9, ...dim }} />}
      <p className="t t-clock" style={dim}>{state.clock}</p>

      {/* left: scroll arrows, then a message or a menu panel */}
      <img className="a hint" src={scrollLeft} alt="" style={{ left: 9.07, top: 98.57, width: 11.34, height: 27.5 }} />
      {s.kind === "run" && state.message && <Message m={state.message} blink={state.blink} />}
      {/* left block: an issue (message) when there is one; otherwise a quiet status line (Sukhman: whenever there
          are no issues). Smaller and silver so a real message is a clear change. Wording: STATUS_OK (approved). */}
      {s.kind === "run" && !state.message && !test && (
        <div>
          <img className="a" src={statusOk} alt="" style={{ left: 84.5, top: 93.5, width: 17, height: 17 }} />
          <p className="t t-status">{STATUS_OK.title}</p>
          {STATUS_OK.subtitle && <p className="t t-status t-sub">{STATUS_OK.subtitle}</p>}
        </div>
      )}
      {s.kind === "params" && <ParamPanel state={state} />}
      {s.kind === "modes" && <ModePanel state={state} />}
      {s.kind === "views" && <ViewsPanel state={state} view={s.view} />}

      {/* centre: speed arc, speed, unit, turn arrows, mode */}
      <RpmArc rpm={state.rpm} shift={state.shift === "shift"} limiter={limiter} blink={state.blink} shiftAt={state.shiftAt} />
      <p className="t t-speed">{state.speedKmh}</p>
      <p className="t t-unit">km/h</p>
      {state.demo && <img className="a" src={arrows} alt="" style={{ left: 276.58, top: 141.8, width: 56.99, height: 17.43 }} />}
      <div className="a turn" style={{ left: 276.58, top: 141.8, width: 28.5, height: 17.43, maskPosition: "0 0", WebkitMaskPosition: "0 0", ...turnLit(state.turn.left) }} />
      <div className="a turn" style={{ left: 305.08, top: 141.8, width: 28.5, height: 17.43, maskPosition: "-28.5px 0", WebkitMaskPosition: "-28.5px 0", ...turnLit(state.turn.right) }} />
      <p className="t t-mode" style={MODE_STYLE[state.mode]}>{state.mode}</p>

      {/* right: gear and scroll arrows. Gear is green in neutral, red while the limiter flashes. */}
      <p className={`t t-gear${neutral ? " gear-n" : ""}${limiter && state.blink ? " gear-limit" : ""}`}>{test ? "N" : state.gear}</p>
      <p className="t t-gearlabel">GEAR</p>
      {/* gear-shift suggestion: up arrow above the gear, down arrow under GEAR */}
      {state.shiftHint === "up" && <span className="a shift-arrow up" aria-hidden="true" />}
      {state.shiftHint === "down" && <span className="a shift-arrow down" aria-hidden="true" />}
      <img className="a hint" src={scrollRight} alt="" style={{ left: 589.28, top: 96.48, width: 11.34, height: 32.65 }} />

      {/* bottom row: tell-tales (dark until their event), fuel, temperature bar */}
      <img className="a lamp" src={drl} alt="" style={{ left: 17, top: 196.5, width: 39.75, height: 19, opacity: drlOn ? 1 : 0 }} />
      <img className="a lamp" src={highBeam} alt="" style={{ left: 24.2, top: 196.5, width: 25.3, height: 19, opacity: highOn ? 1 : 0 }} />
      {LAMPS.map(({ id, src, box }) => {
        const asset = state.demo && id === "oil" ? oilCanOrange : state.demo && id === "coolant" ? coolantOrange : src;
        const on = lampOpacity(state.lamps[id], state.blink, test);
        return <img key={id} className="a lamp" src={asset} alt="" style={{ ...box, opacity: on }} />;
      })}
      {/* fuel with range, one group centred under the dial. Segments keep the Figma gradient; amber on reserve. */}
      <div className="fuel" style={dim}>
        <img src={fuelPump} alt="" style={{ width: 94, height: 17 }} />
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} className={i < fuelSegs ? (lowFuel ? "seg low" : "seg on") : "seg"} style={{ left: 23 + i * 9 }} />
        ))}
        <p className={`range${lowFuel ? " warn" : ""}`}>{state.rangeKm}<small>km</small></p>
      </div>
      {(state.demo || state.lamps.coolant || test) && <img className="a" src={tempBar} alt="" style={{ left: 526.73, top: 197.68, width: 67.45, height: 16.95 }} />}
    </div>
  );
}
