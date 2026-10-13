# Road Mode cluster simulator

Working simulator of Design 3 (Figma slide 31, node `1:52565` "Road Mode- 01") for the Bike Dashboard Design case study.

## What exists now
- Vite + React + TypeScript project, builds to static files (deploys to Vercel as-is).
- `RoadCluster` renders the refined Road Mode 01 frame at its native 610 x 225.4 px, scaled to the window.
- Stage 2b (built, awaiting approval): the whole dash is live from the keyboard. `src/vehicleModel.ts` is the engine and gearbox, `src/bikeState.ts` is everything else (ignition, start rules, switches, dash menus, trip, fuel, temperatures, messages), `src/useCluster.ts` feeds it keys and time.
- The page is labelled as a simulation, shows a one-line hint of what to do next, and lists the keys in four groups.
- `?state=figma` freezes the cluster on the exact Figma frame values, for comparing against `reference/figma-road-mode-01.png`.

## Design previews (Stage 2a, awaiting approval)
- `?preview=<name>` shows a static state of the cluster so it can be approved before its logic is built. Names: `figma` (same as `?state=figma`), `splash`, `check`, `idle`, `riding`, `stand`, `turn`, `abs`, `ice`, `fuel`, `service`, `fault`, `params`, `params-edit`, `modes`, `mode-race`, `mode-wet`, `shift`, `limiter`.
- Live default is now: nothing lit, no message. The Figma frame (all lit, "Rear ABS Inactive") is the placement demo only.
- Arc scale is 0 to 16,000 rpm (placeholder, see `docs/functional-spec.md` section 8).

## Keys (functional spec section 7, approved)
- Ride: `K` ignition, `Enter` start, `W` throttle (hold), `S` brake (hold), `Space` clutch (hold), `E` / `Q` shift up / down, `N` neutral, `L` side stand, `X` kill switch.
- Handlebar: `,` / `.` left / right indicator, `H` hazard, `B` high beam.
- Dash: Up / Down cycle the views (one press away) and scroll menus, Right selects, Left goes back, `M` riding mode list.
- Demo (until the riding world exists): `1` ice, `2` oil pressure, `3` ABS fault, `4` low fuel, `5` service due. Each key toggles its event.
- Departures from the spec, decided while building: `Enter` is the start button while the engine is off and the dash select button once it runs (the spec gave Enter both jobs). The arrow keys no longer work the throttle and brake (Stage 1 did this; the spec gives them to the dash).

## Engine and gearbox model (Stage 2b)
- Real [Official]: primary 1.80, gears 36/15, 34/17, 33/19, 32/21, 30/22, 27/22, final drive 16/41, torque 120.9 Nm at 11,250 rpm, 158.9 kW at 13,500 rpm, 80% of peak torque at 6,000 rpm, the dash reads 5% high.
- Fitted to measured magazine data: drive efficiency 0.82, drag area 0.37 m2, wheelie-control limit. Check with `node scripts/check-model.ts` (RACE A: 0 to 100 km/h 3.40 s, 0 to 200 km/h 6.98 s, top 298.7 km/h true, 314 shown; verified by running it).
- Placeholders: idle 1,300 rpm, Medium and Low power at 88% and 70%, throttle twist time per power mode, launch clutch slip at 7,500 rpm, brake 0.95 g, engine braking, fuel flow (0.9 L/h plus 0.5 L per kWh), coolant warm-up speed, DSC, EBC and ABS level ranges.
- Unverified (spec section 8): shift cue 13,500 rpm, limiter 15,000 rpm, red zone 15,000 to 16,000.
- Rules: a gear that would pass the limiter is refused; neutral is found from 1st or 2nd only (it sits between them); the engine starts in neutral, or in gear with the clutch held and the side stand up; the engine stops if the side stand is down in gear, on the kill switch, or with an empty tank; the riding mode changes only with the throttle closed.

## Dash behaviour (Stage 2b)
- Key-on: dark screen, Ducati logo 1.5 s, all tell-tales 2 s (slide 19), then the run screen. Oil lamp lit until the engine runs.
- Messages: red first, several cycle every 3 s, red flashes for its first 10 s then holds [Official rule]. Message texts ("ABS fault / See dealer", "Service due / In 1,000 km") are placeholders for Sukhman's review. "Rear ABS / Inactive" shows when the ABS level is 3 or lower (Race A and Race B).
- Indicators self-cancel after 0.5 km (placeholder). DRL is on while the engine runs; high beam takes its slot.
- Menus close after 10 s without a press (placeholder). Clock is device time.
- Start steps (Sukhman's change, page chrome): until the bike first moves, a row under the cluster lists the five steps (K ignition, Enter start, L side stand up, E 1st gear, W throttle), ticks the done ones and highlights the next. The hint line explains why W does nothing in neutral, and asks for a click when an embedded page has no keyboard focus.
- Shift indicator (Sukhman's change): an amber shift zone on the scale ring from the riding mode's suggested upshift point to the red zone, and an amber up arrow above the gear when the engine reaches it (down arrow under GEAR when it labours below 3,000 rpm in 2nd or higher with the throttle open). Suggested points [Placeholder]: Road 9,000, Wet 7,500, Sport 11,000, Race A and B 13,500 rpm. The best-acceleration point is close to the limiter, so the white shift cue at 13,500 stays as before.
- Views: Trip (distance, average speed, time), Odometer (total, average use), Temperatures (air, coolant), Rider aids (DTC, DWC, ABS), Navigation (not connected, accessories are out).

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
- (Superseded by the SVG stroke arc, see refinements; none of these files are used now.) `speed-arc.svg` was split into `speed-arc-track.svg`, `speed-arc-fill.svg` and `speed-arc-ring.svg` so the red fill can follow RPM. Path data is unchanged (verified by string comparison). The fill is revealed by a CSS conic-gradient mask centred on (96.0, 95.15) of the SVG, from 236.5 deg, sweep 247 deg. Centre and angles are measured from the path data (verified by circle fit; the Figma fill ends at 15.5 deg, which matches 80.2%).
- `oil-temp.svg` was split into `coolant.svg` (the orange icon paths) and `temp-bar.svg` (the bar). Together they redraw the original (verified: frame difference against Stage 1 is 0.0001 of 255). `temperature.svg` is the oil can (the file name is misleading).
- Red variants `oil-can-red.svg`, `coolant-red.svg`, `warning-red.svg` were made by replacing the orange or amber fill with red (#FF2A1F). Reason: slide 19 says oil pressure and coolant are red. The orange stays only in the placement demo. Colour value is a placeholder (inferred).
- `high-beam.svg`, `engine.svg`, `side-stand.svg`, `snowflake.svg`, `fuel-pump-amber.svg` were DRAWN by Claude in an ISO 6727 style, not exported from Figma. Placeholders until you supply approved pictograms. Their positions (high beam top right, engine and side stand in the bottom-left row) are also placeholders because the Figma frame has no slot for them.
- `ducati-logo.png` is Figma node `1:45956` "Ducati Logo", exported and trimmed (transparent background). Used only on the start-up splash.
- Gear colour: green in neutral, white otherwise (your slide 19), red while the limiter flashes (placeholder).
- REFINEMENT of Road Mode 01 (Sukhman: keep the layout and strong visual decisions, adjust spacing and small elements, apply the approved information list). Each item is a departure from the Figma frame:
  - Unit "KM/HR" is now "km/h" (Ducati and SI usage), 9.5 px instead of 7.2 px, centred under the speed, silver. Reason: 7.2 px is about 1.9 mm on the real 6.9 in screen.
  - "RPM x 1000" label removed: at 5.6 px it was not legible, and the arc now carries its own numerals (below).
  - "GEAR" label 9.5 px, centred on the gear numeral, silver.
  - Air reads "Air 24 °C" (degree sign added) and shares the clock's top line (the two were 0.2 px apart). Turns amber at 4 °C or lower.
  - Location pin shows only while navigation is running (navigation is one press away).
  - Message lines share one left edge (the second line sat 2 px left of the first).
  - Turn arrows are dark until an indicator is on (they were grey at all times).
  - Bottom-left lamps sit on one centre line with an even 28 px pitch (the Figma icons varied in line and gap).
  - Fuel gauge is data driven (17 L tank, 8 segments, Figma gradient kept), amber on reserve. Range added to its right; the group is re-centred under the dial. The pump glyph is split out of `fuel.svg` into `fuel-pump.svg` (path unchanged).
  - Oil can, coolant icon and temperature bar show only when lit (coolant temperature moves to the Temperatures view, one press away).
  - Scroll chevrons at 60% so they read as control hints, not content.
  - A red (critical) message dims air, clock, fuel and range to 35% (slide 20 rule).
  - Sukhman's change 1: high beam and DRL share one headlight slot (bottom left, where the DRL was). Only one is lit at a time; high beam wins. The blue lamp at the top right is removed.
  - Sukhman's change 2: the RPM arc is redrawn as an SVG stroke on the Figma centre, radius and band width (measured from the path data), so both ends are round. Sweep is now 240 deg (-120 to +120) instead of 247 deg, so the round caps stay inside the original band (verified by render). The moving fill edge is square so it reads the exact rpm. Figma gradient kept.
  - Sukhman's change 2 (round 2, "inner divisions do not match"): the band is cut into 8 equal 2,000 rpm segments, and each cut has its numeral (0 to 16, 8 px Inter SemiBold, silver) just outside the arc, so every division lines up with a number. Numerals moved outside because inside they crowded a 3-digit speed. The 0 to 16 scale is a placeholder (unverified, functional spec section 8).
  - Sukhman's change 6 (dial details from a Ducati Scrambler dial photo he supplied): a scale ring just inside the band, with a fine tick every 500 rpm and a longer white tick every 1,000; ticks and a thin arc in red for the red zone (15,000 to 16,000, functional spec section 8, unverified); numerals bold and white (8.6 px); a pointer line at the end of the wake (the official Road rev counter is "pointer plus filled wake", functional spec section 3), red while the wake is white for the shift cue. Not taken from the reference: yellow ticks (Scrambler colour, not in the Panigale brand board), italic numerals, the "rpm x 1000" label and the gear in the dial centre (the gear stays right, Sukhman's layout).
  - Sukhman's change 4: the dotted red ring around the arc is removed (`speed-arc-ring.svg` is no longer used). Its space now holds the numerals.
  - Sukhman's change 5 (round 4: "whenever there are no issues"): the left block shows an issue (message) when there is one; otherwise a quiet status line, green check plus "Systems OK" / "Ride safe" (Sukhman's pick, option B), 13.5 px, smaller than a message so a real issue is a clear change. Riding or stopped. Hidden during the lamp check. `status-ok.svg` drawn by Claude, placeholder art.
  - Sukhman's change 3: more space between speed and "km/h", and between gear and "GEAR": numerals up 4 px, labels down (km/h top 129.6 px, GEAR top 131.6 px).
  - All refinements are judgement calls by Claude for Sukhman's approval (inferred, not verified with riders).
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
