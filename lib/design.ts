// Shared by CSS variables, Recharts, and Leaflet so visualization colors stay aligned.
export const design = {
  background: "#F8FAF4",
  panel: "#FFFFFF",
  raised: "#EAF6FA",
  text: "#203D31",
  secondary: "#24495C",
  accent: "#236780",
  probability: "#9A5B20",
  border: "#BED6DF",
  controlBorder: "#47758A",
} as const;

// Active TANOM semantic palette. CSS variables are emitted by the root layout;
// charts use these same values rather than a second color system.
export const tanomColors = {
  surface: "#F8FAF4",
  panel: "#FFFFFF",
  ink: "#203D31",
  secondary: "#526457",
  leaf: "#476B47",
  rain: "#236780",
  heat: "#94621D",
  soil: "#76552F",
  border: "#D4DECF",
  control: "#6C806B",
  soft: "#EDF2E6",
  infoSurface: "#E9F2F4",
  heatSurface: "#FAF0D7",
  soilSurface: "#F2ECE1",
  error: "#8E3029",
  errorSurface: "#FFF0ED",
  warning: "#775410",
  grid: "#93A18F",
} as const;
