import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors, gradients } from "../theme";
import { fonts, fadeUp } from "../MainVideo";

const FEATURES = [
  "Viral hooks", "Reel scripts", "Captions", "Weekly planner",
  "Brand pitches", "Media kit", "Invoicing", "Income tracker",
  "Profile audit", "SEO keywords", "Series builder", "& 25 more",
];

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eyebrow = fadeUp(frame, fps, 4);
  const title = fadeUp(frame, fps, 12);
  const url = fadeUp(frame, fps, 60);
  const pulse = 1 + Math.sin(frame / 8) * 0.02;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 100 }}>
      <div style={{ textAlign: "center", maxWidth: 1500 }}>
        <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.primary, margin: 0, ...eyebrow }}>
          36 tools · One studio
        </p>
        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: 180,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            margin: "30px 0 0",
            color: colors.ink,
            ...title,
          }}
        >
          Your whole creator{" "}
          <span style={{ background: gradients.warm, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontStyle: "italic" }}>
            business.
          </span>
        </h1>

        <div style={{ marginTop: 50, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxWidth: 1300, marginLeft: "auto", marginRight: "auto" }}>
          {FEATURES.map((f, i) => {
            const s = spring({ frame: frame - (24 + i * 3), fps, config: { damping: 20, stiffness: 200 } });
            return (
              <span
                key={f}
                style={{
                  padding: "14px 22px",
                  borderRadius: 999,
                  background: i === FEATURES.length - 1 ? colors.ink : "rgba(28,20,19,0.06)",
                  color: i === FEATURES.length - 1 ? "#fff" : colors.ink,
                  fontWeight: 700,
                  fontSize: 22,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
                }}
              >
                {f}
              </span>
            );
          })}
        </div>

        <div style={{ marginTop: 70, ...url }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              background: gradients.warm,
              color: "#fff",
              padding: "30px 50px",
              borderRadius: 22,
              fontSize: 42,
              fontWeight: 800,
              fontFamily: fonts.body,
              letterSpacing: "-0.01em",
              boxShadow: "0 24px 60px rgba(214,58,58,0.45)",
              transform: `scale(${pulse})`,
            }}
          >
            blym.life
          </div>
          <p style={{ fontSize: 26, color: colors.inkSoft, marginTop: 22, fontWeight: 600 }}>
            Free trial · No card · Built for creators like you
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};