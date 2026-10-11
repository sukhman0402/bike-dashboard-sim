# Road Mode cluster simulator (set-up stage)

Working simulator of Design 3 (Figma slide 31, node `1:52565` "Road Mode- 01") for the Bike Dashboard Design case study.

## What exists now
- Vite + React + TypeScript project, builds to static files (deploys to Vercel as-is).
- `RoadCluster` renders the Figma frame at its native 610 x 225.4 px, scaled to the window.
- Keyboard-driven (Stage 1): `src/useCluster.ts` reads the keys, `src/vehicleModel.ts` is the scripted engine and gearbox model.
- Values driven by state: speed, RPM arc, gear. Clock, air temperature and mode are still fixed Figma values.
- Everything else (tell-tales, fuel, oil/temperature bars, turn and scroll arrows) is still the static Figma art.
- The page is labelled as a simulation, with a key hint strip.
- `?state=figma` freezes the cluster on the exact Figma frame values, for comparing against `reference/figma-road-mode-01.png`.

## Keys (placeholder map, status: built, not yet approved)
- `W` or Up arrow: throttle (hold). `S` or Down arrow: brake (hold).
- `E`: shift up. `Q`: shift down. `N`: neutral.
- A gear is refused if it would over-rev the engine.

## Vehicle model (all numbers are placeholders)
- Gear tops, acceleration, drag, braking and the 12,000 RPM arc scale are invented to feel plausible. They are not data from any real motorcycle.
- The Figma arc is labelled "RPM x 1000", so the arc follows RPM, not speed.

## What is NOT decided yet (flagged, Sukhman: "I'll cover this later")
- S3 inputs beyond the keyboard (decided: keyboard only)
- S4 look of the page around the cluster
- S5 context (scenarios such as rain, glare, night)
- S6 how it is used for testing
- Standards-based behaviour (tell-tale colours, self-check) waits for the verified standards table in the Phase 1 audit

## Assets
Exported from Figma file `7h8baVVBXfCwBsWUUHjD3N` (SVG text via the plugin API, PNG glyphs checked by checksum).
Known departures from the raw export, found by comparing renders against the Figma screenshot:
- `fuel.svg`: the duplicate stroke-only path was dropped; it rendered the pump bolder than Figma (inferred cause: the export loses Figma's stroke alignment). The pump's even-odd fill rule was added (the export omitted it).
- `wrench.svg` is positioned by measurement (the Figma node is rotated), not by the node coordinates.
- `speed-arc.svg` was split into `speed-arc-track.svg`, `speed-arc-fill.svg` and `speed-arc-ring.svg` so the red fill can follow RPM. Path data is unchanged (verified by string comparison). The fill is revealed by a CSS conic-gradient mask centred on (96.0, 95.15) of the SVG, from 236.5 deg, sweep 247 deg. Centre and angles are measured from the path data (verified by circle fit; the Figma fill ends at 15.5 deg, which matches 80.2%).
- The gear glyph is centred on the middle of Figma's "3" instead of being anchored by its left edge, so "N" and other glyphs sit over the GEAR label. Position of the "3" is unchanged (frame difference against the reference is identical, verified).

## Run
    npm install
    npm run dev        # development
    npm run build      # static build in dist/

## Run notes
- Needs Node 22+ and npm 10+ (verified on Node 22.22.0, npm 10.9.4).
- `npm run build` runs `tsc -b` then `vite build`; verified passing.
- Deploy: Vercel, Framework preset "Other", build command `npm run build`, output directory `dist`.
- Working with Claude Code: open this folder and start `claude`; it reads `CLAUDE.md` automatically.
