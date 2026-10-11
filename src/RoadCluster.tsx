import type { ClusterState } from "./clusterState";
import "./cluster.css";

import abs from "./assets/cluster/abs.svg";
import warning from "./assets/cluster/warning.svg";
import wrench from "./assets/cluster/wrench.svg";
import speedArc from "./assets/cluster/speed-arc.svg";
import fuel from "./assets/cluster/fuel.svg";
import oilTemp from "./assets/cluster/oil-temp.svg";
import location from "./assets/cluster/location.svg";
import scrollLeft from "./assets/cluster/scroll-left.svg";
import scrollRight from "./assets/cluster/scroll-right.svg";
import temperature from "./assets/cluster/temperature.svg";
import drl from "./assets/cluster/drl-a.png";
import arrows from "./assets/cluster/arrows.png";

// Source: Figma file 7h8baVVBXfCwBsWUUHjD3N, node 1:52565 "Road Mode- 01" (slide 31, Interface 03).
// Native size 610 x 225.4 px. Every element sits at the position and size taken from the frame.
export function RoadCluster({ state }: { state: ClusterState }) {
  return (
    <div className="cluster" role="img" aria-label={`Road mode, ${state.speedKmh} kilometres per hour, gear ${state.gear}`}>
      {/* top row */}
      <p className="t t-air">Air {state.ambientTempC}C</p>
      <img className="a" src={location} alt="" style={{ left: 495.55, top: 11.55, width: 10.5, height: 12.9 }} />
      <p className="t t-clock">{state.clock}</p>

      {/* left: rear ABS message and scroll arrows */}
      <img className="a" src={scrollLeft} alt="" style={{ left: 9.07, top: 98.57, width: 11.34, height: 27.5 }} />
      <img className="a" src={abs} alt="" style={{ left: 102.2, top: 68.0, width: 24.02, height: 17.44 }} />
      <p className="t t-msg1">Rear ABS</p>
      <p className="t t-msg2">Inactive</p>

      {/* centre: speed arc, speed, unit, turn arrows, mode */}
      <img className="a" src={speedArc} alt="" style={{ left: 305.66, top: 7.49, width: 189.78, height: 143.7, transform: "translateX(-50%)" }} />
      <p className="t t-speed">{state.speedKmh}</p>
      <p className="t t-unit">KM/HR</p>
      <img className="a" src={arrows} alt="" style={{ left: 276.58, top: 141.8, width: 56.99, height: 17.43 }} />
      <p className="t t-rpm">RPM x 1000</p>
      <p className="t t-mode">{state.mode}</p>

      {/* right: gear and scroll arrows */}
      <p className="t t-gear">{state.gear}</p>
      <p className="t t-gearlabel">GEAR</p>
      <img className="a" src={scrollRight} alt="" style={{ left: 589.28, top: 96.48, width: 11.34, height: 32.65 }} />

      {/* bottom row: tell-tales, fuel, oil and temperature */}
      <img className="a" src={drl} alt="" style={{ left: 17, top: 197, width: 39.75, height: 19 }} />
      <img className="a" src={warning} alt="" style={{ left: 87.49, top: 196.91, width: 24.02, height: 17.44 }} />
      <img className="a" src={abs} alt="" style={{ left: 117.68, top: 196.91, width: 24.02, height: 17.44 }} />
      <img className="a" src={wrench} alt="" style={{ left: 149.17, top: 197.75, width: 23, height: 19 }} />
      <img className="a" src={fuel} alt="" style={{ left: 303, top: 198.49, width: 94, height: 17, transform: "translateX(-50%)" }} />
      <img className="a" src={temperature} alt="" style={{ left: 492.49, top: 203.33, width: 25.58, height: 11.37 }} />
      <img className="a" src={oilTemp} alt="" style={{ left: 526.73, top: 197.68, width: 67.45, height: 16.95 }} />
    </div>
  );
}
