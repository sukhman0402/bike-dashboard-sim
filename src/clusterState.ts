// The values the Road cluster displays. Only the values that appear as text or as the RPM arc
// in the Figma frame (slide 31, "Road Mode- 01") are driven by state; the segmented gauges and
// the tell-tales are still the static Figma art and become state-driven later.
export type ClusterState = {
  speedKmh: number;
  rpm: number;
  gear: number | "N";
  clock: string;
  ambientTempC: number;
  mode: "ROAD";
};

// Full-scale of the RPM arc (the cluster reads "RPM x 1000"). Placeholder scale, not Panigale data.
export const RPM_MAX = 12000;

// Values exactly as drawn in the Figma frame. The Figma arc is filled to 80.2%, so rpm is set to
// match the art (9620). That does not agree with the vehicle model at 56 km/h in gear 3.
export const FIGMA_DEFAULT: ClusterState = {
  speedKmh: 56,
  rpm: 9620,
  gear: 3,
  clock: "09:16 A.M.",
  ambientTempC: 24,
  mode: "ROAD",
};
