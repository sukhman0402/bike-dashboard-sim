# Stage 2b: dashboard logic and real engine model (APPROVED, in progress)

Goal: the refined Road cluster behaves like the real Panigale V4 S dash while you ride it with the keyboard.
Focus is the dashboard. No world, no sound (Stage 3), no Race or Wet layouts.

Success criteria (measurable):
- Full throttle from rest: 0 to 100 km/h in 3.2 to 3.7 s, 0 to 200 km/h in 6.8 to 7.6 s, top speed 290 to 305 km/h (shown speed is +5%).
- Every key in the key map does what the spec says, checked by a scripted key run.
- Every approved state (`r-*` previews) can be reached live, without a preview URL.

## Phases (risk first; one review image or clip at the end of the stage)

| # | Phase | Size | Files | Done when (verification) |
|---|---|---|---|---|
| 1 | Engine and gearbox model: real ratios, primary, final drive, torque curve through 120.9 Nm at 11,250 and 216 hp at 13,500, mass, drag fitted to about 300 km/h, power mode per riding mode. Shift cue at 13,500, limiter at 15,000, wake hidden below 1,000 rpm, shown speed x 1.05 | M | `src/vehicleModel.ts` | Headless full-throttle run prints 0 to 100, 0 to 200 and top speed inside the ranges above |
| 2 | Key-on and start: K ignition, Ducati logo, 2 s lamp check, oil and engine lamps until start, Enter start (neutral, or clutch held), X kill switch, L side stand (stand down in gear stops the engine) | S | `src/useCluster.ts`, new `src/bikeState.ts` | Scripted key run: K, wait, Enter reaches "Systems OK"; start in gear without clutch is refused |
| 3 | Handlebar: , and . indicators (auto-cancel after a set distance), H hazard, B high beam (shares the headlight slot with DRL) | S | `src/bikeState.ts` | Scripted run: arrows flash, cancel after the distance, high beam replaces DRL |
| 4 | Dash buttons: Up and Down cycle the views (one press away), Enter opens the rider-aid menu, M opens the mode list, Left goes back. Mode change applies the real MODE_DEFAULTS and power mode | M | `src/bikeState.ts`, `src/RoadCluster.tsx` (only if a panel needs a hook) | Scripted run: mode change to WET changes the label, levels and acceleration |
| 5 | Trip computer and fuel: odometer, trip, average speed, trip time, consumption from engine load (about 7.6 L/100 km average), range, reserve at 4 L with the low-fuel message | S | `src/bikeState.ts` | Fast-forward run: fuel falls, range tracks it, reserve message appears at 4 L |
| 6 | Messages and tell-tales: one queue, cycles every 3 s, red messages flash 10 s then hold; demo event keys inject ice, oil pressure, ABS fault, low fuel, service due | S | `src/bikeState.ts`, `src/clusterState.ts` | Scripted run: each event key shows its message and lamp; clearing it returns "Systems OK" |
| 7 | Key hints on the page list the new keys, grouped (Ride, Handlebar, Dash, Demo) | S | `src/App.tsx`, `src/index.css` | Screenshot; keys readable, contrast 4.5:1 |
| 8 | Review: images of each state reached live, plus a short screen recording of a ride | XS | scratchpad only | Sent to Sukhman for approval |

Checkpoints: after phase 2 and after phase 5 (build passes, scripted key run green).

## Decisions (filled in from Sukhman's answers)

| # | Decision | Choice | Why |
|---|---|---|---|
| D1 | Key map | functional spec section 7 (decided earlier) | already approved |
| D2 | Rev values | 13,500 shift, 15,000 limiter, red zone 15 to 16 (unverified) | spec section 8 |
| D3 | Throttle feel | progressive: W opens the throttle over about 0.5 s | closer to a real twist grip (Sukhman: recommended) |
| D4 | Start state | ignition off with a "Press K" hint | shows the logo and lamp check like a real key-on |
| D5 | Demo event keys | number keys 1 to 5, listed under Demo | no environment yet to trigger events |
| D6 | Menu screens | wire the Stage 2a screens as they are; Sukhman flags changes at review | they already sit in the refined frame |
| D7 | Clock | device time, "09:16 A.M." style | feels alive |
| D8 | Success criteria mode | acceleration targets measured in RACE A (High power); Road (Medium) is slower by design | published tests use full power |

## Always / Never

- Always: real V4 S values where they exist; every invented number marked placeholder in code and README.
- Always: build passes and the scripted key run passes before the review image.
- Never in this stage: environment or world, engine sound, Race or Wet layouts, cruise control, navigation content, settings menu, power and torque, lean angle and g-meter views.
- Never: change the approved visual design. A logic need that changes a screen goes to Sukhman as an image first.

## Progress

| Phase | Status |
|---|---|
| 1 | done: `node scripts/check-model.ts` passes (RACE A 0-100 3.40 s, 0-200 6.98 s, top 298.7 km/h) |
| 2 to 6 | done: scripted key run in the real app passed every step (key-on, start rules, ride, indicators, views, mode change, demo events, rider-aid edit, ignition off); one bug found and fixed (clutch read a frame late on start) |
| 7 | done: four key groups and a hint line; text contrast 8:1 and above |
| 8 | done: review images and a 45 s ride clip sent |
| 9 | Sukhman's review round 1: start steps row and W-in-neutral hint; shift zone and shift arrows. Built and checked by a scripted run; waiting for approval |

## Follow-up (after approval): per-gear shift bracket
- Sukhman flagged that the shift bracket should change per gear like the real V4 S. Research (owner's manuals, same engine) found a per-gear limiter (14,500 / 15,000 in 6th), the amber and red wake rule, and a cold-engine limit. No per-gear shift-up rpm is published. Built, checked by a scripted run (cold, warming, 2nd, 6th), waiting for approval.
- Sukhman: the RPM meter flickered. Damped needle, hysteresis on the amber and red states, no blink. Measured: 0 colour changes in 3 s at the limiter; needle jitter 0.033 to 0.007 px per frame.
- Sukhman: the meter held at 7,500 for 1 to 2 s when pulling away. Cause: clutch slip held the engine at 7,500 until the wheel caught up (about 85 km/h). Fixed: slip fades with speed slower than the wheel adds rpm, per power mode. Verified headless: rpm never falls during a launch; Road climbs from about 3,300 at 0.6 s to 5,200 at 2.4 s; model check still passes (RACE A 0-100 3.42 s).
