# CLAUDE.md: Bike Dashboard simulator

Read this first in every session. Keep it short and current.

## What this is
- A working simulator of Design 3 (Road mode) from the Bike Dashboard Design case study (M.Des IUxD, Dhirubhai Ambani University).
- Source design: Figma file `7h8baVVBXfCwBsWUUHjD3N`, slide 31, node `1:52565` "Road Mode- 01".
- Owner: Sukhmanpreet Singh Saini. It is a portfolio piece, so it is judged by recruiters and design leads.
- Related site: https://bike-dashboard-research.vercel.app/ (survey analysis; separate repo). Do not link this project to the portfolio yet.

## Status (update when it changes)
- Stage 1 APPROVED and pushed: keyboard input, scripted engine and gearbox model, RPM arc, simulation label, key hints. Its gear speeds are placeholders and will be replaced by the real V4 S ratios (Stage 2b).
- State-driven values: speed, RPM arc, gear (`src/clusterState.ts`, `src/vehicleModel.ts`, `src/useCluster.ts`). Clock, air temperature and mode are fixed Figma values.
- Fuel, oil/temperature bars and tell-tales are still static Figma art.
- Inputs: keyboard only (decided). Page design, scenarios and testing use (S4 to S6) are NOT decided. Ask before building them.
- Decided: bike is the Ducati Panigale V4 S (MY25 data). Simulator must follow the real interface IA and real values. Rear ABS Inactive and the bottom tell-tales are demo placement, they light only on a fault or event.
- RE-DESIGN CLARIFIED: it is a REFINEMENT of Road Mode 01, not a new design. Keep the central arc dial with speed inside, gear right, ROAD under the arc, left message block, bottom lamp row, top row. Change only spacing, small elements and the approved information (fuel with range, air, clock always on; navigation one press away). Refinements are in `src/RoadCluster.tsx` and logged in `README.md`, including Sukhman's flagged changes (shared headlight slot, arc with round ends and equal 2,000 rpm divisions with numerals outside, no dotted ring, scale ring with 500 rpm ticks, red zone and pointer (from a Scrambler dial reference), wider speed and gear label spacing, left block shows an issue, else a quiet status line "Systems OK / Ride safe" (approved)); previews `?preview=r-rest`, `r-ready`, `r-fuel`, `r-ice`, `r-oil`, `r-views`, `r-check`. APPROVED and committed (rounds 1 to 4). The studies below are research only, superseded as designs.
- Earlier exploration: Sukhman asked to re-design the whole design. Sukhman's principle: Road is minimal (commute), each mode has its own density budget. Studies in `design/explorations/` (A to D, then `sys.html` density system) and `docs/design-exploration.md`. Current proposal: Road 5, Wet 6, Sport 7, Race 8 focus elements at rest. Road information list APPROVED (`docs/road-mode-information.md`): range and air always visible, navigation one press away. Road redesign drawn in `design/explorations/road.html`, awaiting approval. Brand rules applied from the brand board (slide 26): see `docs/design-exploration.md` and `design/explorations/sys2.html`. Superseded: the refined Road Mode 01 above is the frozen Road design. The state model, previews and assets from Stage 2a are reusable.
- Stage 2a BUILT (on the old Design 3, not committed, may be superseded): static design previews (`?preview=<name>`) for start-up, messages, menus, mode list, shift and limiter. Not committed yet (commit after approval).
- Spec decisions taken (see `docs/functional-spec.md` section 8): 0 to 16 rpm scale, Road layout only first, slide 19 table wins on tell-tales, accessories out except cruise control.
- Product vision (Sukhman): the simulator is a game, like GTA. The player rides the bike with the keys through an environment; the camera stays fixed on the rider's view of the dashboard, and the dashboard is the focus. Environment detail (world, rendering, scenarios) is still to be scoped with Sukhman.
- Next stages (one image for approval after each): 2a design images for undrawn states, 2b interface logic and real engine model, 3 engine sound, 4 rest of cluster, 5 environment (game-style riding world, see vision; detail not decided).

## Commands (verified: Node 22.22.0, npm 10.9.4)
- `npm install`
- `npm run dev` : dev server (Vite, default port 5173)
- `npm run build` : type-check + static build into `dist/` (about 1 s)
- `npm run preview` : serve `dist/`
- No test runner is set up. Check changes by building, then comparing a screenshot against `reference/figma-road-mode-01.png`.

## File map
- `src/App.tsx` : fits the cluster to the window (`useFitScale`, max scale 2.4), simulation label, key hints
- `src/useCluster.ts` : keyboard handling and the frame loop
- `src/vehicleModel.ts` : scripted engine and gearbox model (placeholder numbers)
- `src/RoadCluster.tsx` : absolutely positioned Figma elements; text comes from `ClusterState`
- `src/clusterState.ts` : `ClusterState` type and `FIGMA_DEFAULT` (56 km/h, gear 3, 09:16 A.M., 24 C)
- `src/cluster.css`, `src/index.css` : styles
- `src/assets/cluster/` : SVG/PNG exported from Figma
- `docs/road-mode-information.md` : what Road mode must show (law, Ducati, IA, survey), three tiers
- `docs/functional-spec.md` : draft functional spec (IA, real values, tell-tale rules, key map, open questions)
- `reference/figma-road-mode-01.png` : the visual target

## Rules
1. No em dashes in any text, code comment or doc.
2. Match the Figma frame. Any departure from the raw export must be logged in `README.md` with the reason and whether it is verified or inferred.
3. Ducati name and marks may be used (Sukhman's decision, academic project). Keep the visible simulation label (rule 4). A visible "unofficial academic project, not affiliated with Ducati" note is proposed, not yet approved.
4. Label the page as a simulation. All speeds, fuel, temperatures and warnings are scripted or invented, never real vehicle data.
5. Do not invent standards behaviour (tell-tale colours, self-check sequence) until the verified standards table exists. Until then, mark such behaviour "placeholder".
6. Static build only: no backend, no network calls, no analytics, no CDN. Fonts are bundled (`@fontsource/inter`).
7. Accessibility: keyboard reachable controls, visible focus, `prefers-reduced-motion` respected, text contrast 4.5:1 or better on the page chrome.
8. Claude never commits or pushes. Sukhman does, from his machine. Say which files changed and give the paths.
9. When handing over a file, give the breadcrumb path (for example `src > RoadCluster.tsx`).
10. Say what is verified, inferred and untested. Do not claim a behaviour works until it has been run.

## Working style
- Pointers and short segments, not long paragraphs.
- Ask a relevant question when a choice changes the outcome. One decision at a time for steps only he can do.
- Flag whether an action is reversible or destructive before doing it.
- Lead with the most important finding.
