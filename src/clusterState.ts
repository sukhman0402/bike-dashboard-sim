// The values the Road cluster displays. Set-up stage: only the values that appear as text
// in the Figma frame (slide 31, "Road Mode- 01") are driven by state; the arc, the segmented
// gauges and the tell-tales are still the static Figma art and become state-driven later.
// Which inputs change this state (S3 to S6) is not decided yet.
export type ClusterState = {
  speedKmh: number;
  gear: number | "N";
  clock: string;
  ambientTempC: number;
  mode: "ROAD";
};

// Values exactly as drawn in the Figma frame.
export const FIGMA_DEFAULT: ClusterState = {
  speedKmh: 56,
  gear: 3,
  clock: "09:16 A.M.",
  ambientTempC: 24,
  mode: "ROAD",
};
