# Functional spec: Panigale V4 S Road cluster (draft for approval)

Status: DRAFT. Nothing in this file is built yet. Sukhman approves, then it is built stage by stage.

Source tags used below:
- [Official] Ducati Panigale V4 owner's manual MY25 (read as extracts through a web fetch tool, not the full 300 pages) and ducati.com tech spec pages.
- [Figma] Sukhman's case study file `7h8baVVBXfCwBsWUUHjD3N`, slide and node ids given.
- [Measured] magazine test data, not published by Ducati.
- [Inferred] my reading, not stated in a source.
- [Placeholder] invented to keep the simulator running until a real value is given.

## 1. Information architecture to follow

[Figma] slide 36 (node 1:55299) and slide 37 (node 1:56249).

| Layer | Items |
|---|---|
| Top | Time, Mode indicator (Race, Sports, Road, Wet), System alerts |
| Mid | Speed, Gear indicator, Rev counter, Riding mode, Lap timer |
| Bottom | Parameter menu (DTC, DWC, DSC, EBC, ABS), Temperature, Fuel level, Trip and odometer, Service icons |

Road mode hierarchy [Figma slide 37]:
- Primary: speed, gear, time (also rev counter, clock, riding mode)
- Secondary: fuel, temperature (air and coolant), trip info, cruise control, warning icons
- Tertiary: menu access

Not in the Figma file: button mapping, menu screens for Road, user flows, self-check sequence, any threshold numbers.

## 2. How each Figma element behaves in the simulator

| Road-01 element (node 1:52565) | Behaviour | Source |
|---|---|---|
| Speed "56", KM/HR | Always on. Shows true speed x 1.05 (the real dash over-reads by 5%) | [Official] Road Infomode item 1 |
| Gear "3" | Always on. N when in neutral | [Figma], [Official] |
| Rev arc | Pointer plus filled wake to current rpm. Wake hidden below 1,000 rpm. Wake flashes amber at shift point, flashes red at limiter | [Official] |
| ROAD label | Active riding mode name | [Official] |
| Clock | Always on. Starts 09:16 A.M. and ticks (scripted) | [Figma], [Placeholder] |
| Air 24C | From the scenario. Ice warning on at 4 C or lower, clears at 6 C or higher | [Official] for the ice rule |
| Left block "Rear ABS Inactive" | Message area. Empty when nothing to say. Shows active warnings one every 3 s | [Official] warning display, [Inferred] mapping |
| Bottom icons and fuel/oil/temperature | Dark or off by default. Light only on their event (section 4) | Sukhman's note, [Figma] slide 19 |
| Fuel pump and 8 segments | 17 L tank, 8 segments, reserve at 4 L | [Official] 17 L with 4 L reserve, [Inferred] segment mapping |
| Scroll chevrons (left) and stacked control (right) | Visual hint for the left switchgear (up, down, select) | [Inferred] |
| Turn arrows under speed | Grey at rest, green and flashing when an indicator is on, auto-cancel above 20 km/h after a turn | [Figma] slide 19, [Official] auto-cancel |

"Rear ABS Inactive" in the official dash is the warning "Rear ABS Off" (yellow). It appears when the ABS level controls the front wheel only. Race A, Race B (ABS level 3) and the other front-only levels show it. Road and Sport (ABS level 6) do not. So in Road mode it is NOT shown by default.

## 3. Real bike values (V4 S, MY25)

| Item | Value | Source |
|---|---|---|
| Engine | 1,103 cc, 90 degree V4, 81 x 53.5 mm | [Official] |
| Peak power | 158.9 kW (216 hp) at 13,500 rpm (209 hp at 12,750 US) | [Official] |
| Peak torque | 120.9 Nm at 11,250 rpm | [Official] |
| Torque shape | 80% of peak torque at 6,000 rpm | [Official] Ducati engine page |
| Firing order | "Twin Pulse", firings at 0, 90, 290, 380 degrees | [Official] |
| Primary drive | 1.80 | [Official] |
| Gear ratios | 1: 36/15, 2: 34/17, 3: 33/19, 4: 32/21, 5: 30/22, 6: 27/22 | [Official] |
| Final drive | chain, 16 front, 41 rear teeth | [Official] |
| Rear tyre | 200/60 ZR17 | [Official] |
| Front tyre | 120/70 ZR17 | [Official] |
| Fuel tank | 17 L including 4 L reserve | [Official] |
| Fuel consumption | 7.6 L/100 km (homologation) | [Official] via spec sites |
| Wet weight, no fuel | 187 kg | [Official] |
| Top speed | about 295 to 304 km/h | [Measured] |
| 0 to 100 km/h | about 3.4 to 3.5 s | [Measured] |
| 0 to 200 km/h | about 7.1 s | [Measured] |
| Cold start | idle held high for 30 s or until 60 C | [Official] |
| Idle | rear bank cylinders disabled at idle with throttle closed (conditions apply) | [Official] |
| Rev limit | NOT PUBLISHED for V4 S. See open question 1 | unverified |

Cross-check done [Inferred, computed]: official ratios with a 2.08 m rolling circumference give 297 km/h in 6th at 13,500 rpm. That matches the measured top speed, so the ratios and tyre size are consistent.

Speed in each gear at 13,500 rpm (computed, 2.08 m): 1st 152, 2nd 183, 3rd 210, 4th 240, 5th 268, 6th 297 km/h.

Model plan: engine torque curve through the real anchor points, real gearing, mass about 280 kg with rider and fuel [Inferred, rider 80 kg assumed], drag area fitted so 6th gear tops out near 300 km/h [fitted], wheelie and traction limits scaled by DWC and DTC level [Placeholder]. Checks to run: 0 to 100 km/h near 3.4 s, 0 to 200 km/h near 7.1 s, top speed near 300 km/h.

## 4. Tell-tales and messages (event driven)

Default state: everything off. Colours follow Sukhman's slide 19 table [Figma]. Where the Ducati manual differs, the difference is noted.

| Tell-tale | Lights when | Colour | Note |
|---|---|---|---|
| Neutral N | gearbox in neutral | green | same in both sources |
| Oil pressure | key on before start, goes out a few seconds after start; also on low pressure | red | Figma Road-01 art is orange, table says red. Needs recolour when built |
| ABS | key on self-check, then off; on a fault | amber | same in both sources |
| Generic error "!" | a fault is active | amber | [Inferred] mapping of the circled "!" |
| MIL / engine fault | key on, stays on if a fault is found | amber | |
| Low fuel | fuel at or below 4 L | amber | [Inferred] reserve equals light threshold |
| Service wrench | service due (oil and Desmo service 1,000 km before, annual 30 days before) | amber | [Official] distances |
| Side stand | stand down | red in the Ducati manual, amber in slide 19 | CONFLICT, open question 3 |
| Turn signal | indicator on | green, flashing | |
| High beam | high beam on | blue | |
| DRL "A" | DRL in Auto mode | green | [Inferred] mapping of the headlight-with-A icon |
| Traction (DTC and others) | intervention in progress | amber, flashing in Figma. In the Ducati Road Infomode the parameter warning light turns on | |
| Shift light | at shift point rpm | green in Ducati manual, white/red in slide 19 | CONFLICT, open question 3 |
| Limiter | rev limiter active | red | |
| Coolant temperature | over temperature | red | threshold not in any source, [Placeholder] |

Self-check at key on:
- [Official] Ducati logo, then the warning lights light in sequence. If speed is above 5 km/h the check is skipped and only active lights stay on.
- [Figma] slide 19: all mandatory tell-tales light for at least 2 s.
- Proposed: follow the Figma 2 s rule in the Road layout and show the Ducati logo first. Needs approval.

Warnings and the left block [Official]:
- At key on, active warnings show large for 3 s, then small. Several warnings cycle one every 3 s.
- Errors flash red large for 10 s, then small, and stay until fixed.
- Ice (4 C or lower), low fuel, rear ABS off, service due, brake light fault, engine auto shutdown ("Engine auto shutdown", then "Press start").

## 5. Riding modes and defaults [Official, MY25 table]

| | Race A | Race B | Sport | Road | Wet |
|---|---|---|---|---|---|
| Power mode | High | High | Medium | Medium | Low |
| Throttle response | Dynamic | Dynamic | Smooth | Smooth | Dynamic |
| ABS | 1 | 3 | 6 | 6 | 7 |
| DTC | 2 | 3 | 5 | 6 | 8 |
| DWC | 2 | 3 | 5 | 6 | 6 |
| DSC | 1 | 2 | 2 | 2 | 2 |
| EBC | 2 | 2 | 2 | 2 | 3 |
| DQS (quickshifter) | On | On | On | On | On |

Note: the official table lists "Max power 120.94 Nm at 11,250 rpm" under Wet (a low-power setting). Exact Low power figure is not in the extracts I read.

Naming: Figma uses Race, Sports, Road, Wet (slide 36), and "RAINY" on the Wet screen. Ducati uses Race A, Race B, Sport, Road, Wet. Ducati also has a separate "Infomode" (Track layout or Road layout) independent of the riding mode.

Screens that exist in Figma: Road-01, Road-02, Race-01, Rainy-01 and 02. No Sport screen is drawn.

## 6. Menus [Official]

- Parameter quick menu (Road layout): DTC, DSC, DWC, EBC, ABS. Scroll with up and down, select, then pick a level. If a parameter is Off it cannot be quick-changed.
- Functions menu: Pit limiter and Power Launch are Track only. In Road layout, trying the Pit limiter shows "Pit limiter cannot be enabled in Road Infomode". Power Launch works only at a standstill.
- Views from the main page: Power and Torque, Lean angle, g-Meter, Tyre pressure, Trip info.
- Road trip info: Total (odometer), Consumption, Trip, average consumption, average speed, trip time.
- Settings menu: Vehicle, Display (units, language, date and time), Track, Advanced (Riding Mode setup, Tyre calibration), Devices.
- Setting DTC to Off also turns DWC Off.

Road screens for menus are NOT drawn in Figma. They have to be designed (as images for approval) before they are built.

## 7. Proposed keyboard map (placeholder, needs approval)

Riding:
- W throttle (hold), S brake (hold), Space clutch (hold)
- E shift up, Q shift down (quickshifter, clutch not needed), N neutral
- K ignition on and off, Enter start, X kill switch, L side stand

Left switchgear (dash):
- Arrow Up, Down, Left, Right and Enter for scroll, select and back
- M riding mode button

Handlebar:
- , left indicator, . right indicator, H hazard, B high beam toggle

Real rules to apply:
- Engine starts with side stand down only in neutral. In gear, the clutch must be pulled and the stand must be up.
- Gear change down is refused if it would over-rev.

## 8. Decisions taken (Sukhman delegated these; each can be reversed)

1. Rev scale and limiter (updated in Stage 2b from the owner's manuals): scale 0 to 16 (x1000). Limiter 14,500 rpm in 1st to 5th and 15,000 rpm in 6th [Official]. Red zone starts at the engaged gear's limiter. Shift-up cue at 13,500 [Inferred]. Cold-engine warning at 5,000 rpm below 40 C and 9,000 rpm from 40 to 70 C [Official]. Originally all four were UNVERIFIED (Ducati publishes none for the V4 S; owner reports differ). Each is one constant, so a real value drops in without rework. Reason: it keeps the arc in step with the designer's own scale, and the power peak (13,500) sits where the shift light fires.
2. Scope: Road layout only. All five riding modes change the real parameters (power mode, throttle response, ABS, DTC, DWC, DSC, EBC). Wet and Race layouts come after Road is complete, because their designs exist (Rainy-01, Race-01) and Sport has none. Reason: finish one mode to a high standard before widening.
3. Source priority: Sukhman's slide 19 table wins for tell-tale colours, flash behaviour and the 2 s self-check. The Ducati manual fills any gap the table leaves. Every conflict is logged in `README.md`. Side stand is amber, shift light is white then red, oil lamp is red (the orange in Road-01 is the placement demo). The Ducati logo shows before the lamp check, as on the real dash. Treated as "placeholder" under rule 5 until Sukhman confirms slide 19 is the verified table.
4. Keyboard map: section 7 as written.
5. Accessories: out are tyre pressure, navigation, data logger, heated grips. In (later, Stage 4) is cruise control, because it is in the Road IA.

## 9. Stage plan (one image for approval after each)

- 2a Design images for states that are not drawn: key-on check, warnings in the left block, parameter menu, mode change.
- 2b Interface logic and real engine and gearbox model.
- 3 Engine sound from the real firing order and rpm.
- 4 Remaining cluster elements (fuel, trip, temperatures, views).
- 5 Environment (scope not decided).
