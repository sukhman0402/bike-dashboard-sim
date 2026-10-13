# Road mode: what the dashboard must show (daily commute)

Purpose: the information list the Road screen is redesigned from. The Pinterest reference is discarded.

Source tags:
- [Law] UN regulations, read this session.
- [Law, not checked] From general knowledge of the regulations, not re-read this session.
- [Ducati] Panigale V4 MY25 owner's manual, read as extracts.
- [IA] Sukhman's Figma, slide 37, Road mode.
- [Survey] Sukhman's survey, 194 riders (bike-dashboard-research.vercel.app). Caveat: 45.4% ride scooters and 51.0% only commute, so it describes commuters, not superbike riders. Stated preference, not tested on a moving bike.
- [Inferred] My reasoning.

## The evidence in one place

| Item | Law | Ducati Road screen | Your IA (Road) | Survey: keep always visible | Survey: checked most often |
|---|---|---|---|---|---|
| Speed | Required [Law] | Yes, reads 5% high | Primary | 88.7% | 83.0% |
| Fuel level | | Low-fuel lamp and reserve distance | Secondary | 85.6% | 85.1% |
| Turn indicators | Required when fitted [Law, not checked] | Lamps | Warning icons | | 60.3% |
| Odometer, trip | Odometer required [Law] | Trip info view | Secondary | | 21.1% |
| Gear | Neutral tell-tale green [Law] | Yes, mode name under it | Primary | | 19.6% |
| Clock | | Yes | Primary | 36.6% | 16.5% |
| Navigation | | Accessory only | | 42.3% | 14.9% |
| Range | | Reserve distance only | | 40.7% | |
| Alerts | | Lamps and messages | Warning icons | 29.4% | |
| Rev counter | | Yes, pointer and grey wake | Primary | | |
| Riding mode | | Yes | Primary | | |
| Air temperature | | Yes | Secondary | | |

Survey feature ratings, 1 to 5: Fuel 4.03, Speed 3.90, Range 3.31, Navigation 3.29, Service reminders 3.16, Riding modes 2.89, Weather 2.63, Notifications 2.31.

Survey direction 02 (Sukhman's own): after speed and fuel, nothing is wanted always visible by more than half of riders, so keep everything else off the default view or one step away.

Gear is checked by only 19.6% in the survey [Survey], but 45.4% of riders ride gearless scooters. On a six-speed manual superbike gear is essential [Inferred], and Ducati and your IA both make it primary.

## Laws read this session
- UN R39: a speedometer and an odometer must be fitted. Indicated speed must never be below true speed. [Law] Ducati's +5% reading fits this.
- UN R39 amendment: the odometer must show its unit. [Law]
- UN R60: the neutral tell-tale is green and lit in neutral. The speedometer is lit whenever the position lamp or headlamp is on. [Law]
- EU Directive 93/29 (equivalent to R60): red means danger, amber caution, green safety, and blue is reserved for the main beam. Symbols must stand out, bright on dark or dark on bright. [Law]
- Not re-read this session [Law, not checked]: turn signal and main beam tell-tales (UN R53), the ABS failure warning (UN R78) and the engine fault lamp (Euro 5 OBD). All are normally mandatory when the system is fitted.

## Proposed Road screen: three tiers

### Tier 1: always on screen (5 groups)
1. **Speed**: legal, and the top rider priority.
2. **Gear, with the riding mode under it**: Ducati draws them as one group. Neutral shows as a green N.
3. **Fuel**: promoted from secondary. Riders want it as much as speed (85.6%).
4. **Clock**: in your IA as primary, and small.
5. **Rev line**: low weight. It carries the shift cue and the redline.

### Tier 2: appears by itself when it applies
Lamps and messages, dark until needed:
- Turn indicators (green, flashing)
- High beam (blue)
- Side stand down
- Low fuel, with distance on reserve
- Oil pressure (red)
- Coolant over temperature (red)
- ABS fault, or rear ABS off (amber)
- Engine fault (amber)
- Battery and charging (red)
- Ice risk at 4 °C or lower (Ducati shows the air temperature then)
- Traction or wheelie control intervening (amber)
- Service due (shown at key-on)
- Cold-engine idle and engine auto shutdown messages
- Faults written as plain language, red, flashing for 10 s, then held small
- Cruise control active (if fitted)

### Tier 3: one press away
- Trip info: odometer (must exist, and must be reachable), trip, consumption, average consumption, average speed, trip time, range
- Air and coolant temperature
- Rider aids: DTC, DSC, DWC, EBC, ABS levels
- Riding mode change
- Settings
- Navigation and phone (opt-in layer; survey direction 06)

### Not in Road at all
Lap timer, lean angle, g-meter, power and torque view, launch control, pit limiter. Ducati itself blocks the pit limiter in the Road layout ("Pit limiter cannot be enabled in Road Infomode"). [Ducati]

## Decisions (Sukhman, approved)
- The three-tier Road screen above: approved.
- Range: always visible, next to fuel.
- Air temperature: always visible.
- Navigation: one press away (in the views, after Trip, Odometer, Temperatures, Rider aids).
- Review format: images in the conversation.

Result: Road shows 6 things at rest in 5 groups (speed; gear with mode; fuel with range; air and clock; rev line). Within the slide 20 cap of 5 to 7.
Drawn in `design/explorations/road.html` (states rest, fuel, ice, oil, views, check).
