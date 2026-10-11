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
- Spec decisions taken (see `docs/functional-spec.md` section 8): 0 to 16 rpm scale, Road layout only first, slide 19 table wins on tell-tales, accessories out except cruise control.
- Next stages (one image for approval after each): 2a design images for undrawn states, 2b interface logic and real engine model, 3 engine sound, 4 rest of cluster, 5 environment (scope not decided).

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
