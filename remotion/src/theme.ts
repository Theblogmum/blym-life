// Blym brand palette — converted from oklch in src/styles.css to hex/rgb for Remotion
export const colors = {
  bg: "#fdf9f7",
  bgWarm: "#fbeee9",
  ink: "#1c1413",
  inkSoft: "#3a2a28",
  primary: "#d63a3a",       // warm red (oklch 0.62 0.22 8)
  primaryDeep: "#a82828",
  coral: "#f08274",         // oklch 0.78 0.16 18
  pink: "#e87aa8",          // oklch 0.72 0.18 340
  cream: "#fdf2e7",
  amber: "#f4b860",
  mint: "#9dd9b8",
  white: "#ffffff",
};

export const gradients = {
  warm: `linear-gradient(135deg, ${colors.coral}, ${colors.primary})`,
  hero: `linear-gradient(135deg, #fdeeea 0%, #f9d4cc 55%, #f0a89c 100%)`,
  bloom: `linear-gradient(135deg, ${colors.pink}, ${colors.primary})`,
  ink: `linear-gradient(135deg, ${colors.ink}, #0a0606)`,
};