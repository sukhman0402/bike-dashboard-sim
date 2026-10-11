# Road Mode cluster simulator (set-up stage)

Working simulator of Design 3 (Figma slide 31, node `1:52565` "Road Mode- 01") for the Bike Dashboard Design case study.

## What exists now
- Vite + React + TypeScript project, builds to static files (deploys to Vercel as-is).
- `RoadCluster` renders the Figma frame at its native 610 x 225.4 px, scaled to the window.
- Text values (speed, gear, clock, air temperature, mode) come from `ClusterState` (`src/clusterState.ts`).
- Everything else (speed arc, tell-tales, fuel, oil/temperature bars) is still the static Figma art.

## What is NOT decided yet (flagged, Sukhman: "I'll cover this later")
- S3 inputs (keyboard, on-screen controls, scripted scenarios)
- S4 look of the page around the cluster
- S5 context (scenarios such as rain, glare, night)
- S6 how it is used for testing
- Standards-based behaviour (tell-tale colours, self-check) waits for the verified standards table in the Phase 1 audit

## Assets
Exported from Figma file `7h8baVVBXfCwBsWUUHjD3N` (SVG text via the plugin API, PNG glyphs checked by checksum).
Known departures from the raw export, found by comparing renders against the Figma screenshot:
- `fuel.svg`: the duplicate stroke-only path was dropped; it rendered the pump bolder than Figma (inferred cause: the export loses Figma's stroke alignment). The pump's even-odd fill rule was added (the export omitted it).
- `wrench.svg` is positioned by measurement (the Figma node is rotated), not by the node coordinates.

## Run
    npm install
    npm run dev        # development
    npm run build      # static build in dist/

## Run notes
- Needs Node 22+ and npm 10+ (verified on Node 22.22.0, npm 10.9.4).
- `npm run build` runs `tsc -b` then `vite build`; verified passing.
- Deploy: Vercel, Framework preset "Other", build command `npm run build`, output directory `dist`.
- Working with Claude Code: open this folder and start `claude`; it reads `CLAUDE.md` automatically.
