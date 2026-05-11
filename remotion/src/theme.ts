// Blym brand palette — converted from oklch in src/styles.css to hex/rgb for Remotion
export const colors = {
  bg: "#fffdfc",
  bgWarm: "#fff3e9",
  ink: "#0c0606",
  inkSoft: "#443a39",
  primary: "#ea306d",       // brand rose (oklch 0.62 0.22 8)
  primaryDeep: "#ce0042",   // accent (oklch 0.52 0.24 12)
  coral: "#ff8990",         // oklch 0.78 0.16 18
  pink: "#ec71c7",          // oklch 0.72 0.18 340
  cream: "#faefdd",
  amber: "#dfc79f",
  mint: "#acd7ba",
  white: "#ffffff",
};

export const gradients = {
  warm: `linear-gradient(135deg, ${colors.coral}, ${colors.primary})`,
  hero: `linear-gradient(135deg, #ffeef0 0%, #ffd0d8 55%, #ff9aab 100%)`,
  bloom: `linear-gradient(135deg, ${colors.pink}, ${colors.primary})`,
  ink: `linear-gradient(135deg, ${colors.ink}, #0a0606)`,
};