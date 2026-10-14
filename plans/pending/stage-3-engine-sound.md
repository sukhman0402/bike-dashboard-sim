# Stage 3: engine sound (plan, awaiting answers and approval)

Goal: the V4 S sounds like a V4 S while you ride, driven by the same engine model that moves the dash.

Success criteria:
- The firing rhythm follows the real "Twin Pulse" order (firings at 0, 90, 290 and 380 degrees of the 720 degree cycle), so idle has the uneven V4 beat, not a straight-four whine.
- Pitch and loudness follow rpm and throttle with no clicks or gaps, from idle to the 14,500 rpm limiter, checked by a recorded clip.
- Sound starts only after a key press (browsers require it) and can be muted from the keyboard and from a visible button.
- Static build only: no network calls, no CDN (rule 6).

## Phases (one review clip with sound at the end)

| # | Phase | Files | Done when |
|---|---|---|---|
| 1 | Sound engine: Web Audio graph built from the firing order, rpm, throttle and load; idle, rev, overrun | new `src/engineSound.ts` | A headless render of rpm sweeps (idle, 6,000, 12,000, limiter) shows the expected firing frequencies |
| 2 | Hook it to the bike: starter, running, limiter cut, quickshift blip, kill and stall | `src/useCluster.ts` | Scripted key run records a clip; events line up with the dash |
| 3 | Small sounds: indicator tick, wind at speed | `src/engineSound.ts` | Heard in the clip |
| 4 | Mute: a key and a page button, remembered for the visit | `src/App.tsx`, `src/useCluster.ts` | Keyboard reachable, visible focus |
| 5 | Review: a 30 to 45 s clip with sound | scratchpad only | Sent to Sukhman |

## Decisions (pending answers)
- D1 Source of the sound: pending Q1
- D2 Extra sounds: pending Q2
- D3 Mute key and default: pending Q3

## Never in this stage
Riding world, Race and Wet layouts, music, any downloaded or streamed audio.
