import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors, gradients } from "../theme";
import { fonts, fadeUp } from "../MainVideo";

const HOOKS = [
  { score: 94, text: "Stop scrolling if you've ever felt invisible online." },
  { score: 91, text: "I gained 10k followers by doing the opposite of advice." },
  { score: 88, text: "The 3 captions that doubled my saves last month." },
  { score: 85, text: "POV: you finally found a creator app that gets you." },
];

export const SceneHooks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = fadeUp(frame, fps, 4);

  return (
    <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", width: "100%" }}>
        <div style={{ ...head }}>
          <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: colors.primary, margin: 0 }}>
            Viral Lab
          </p>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              margin: "12px 0 0",
              color: colors.ink,
            }}
          >
            Hooks that <span style={{ fontStyle: "italic", color: colors.primary }}>actually</span> stop the scroll.
          </h2>
        </div>

        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 18 }}>
          {HOOKS.map((h, i) => {
            const s = spring({ frame: frame - (18 + i * 10), fps, config: { damping: 18, stiffness: 140 } });
            return (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  padding: "28px 36px",
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  boxShadow: "0 12px 30px rgba(28,20,19,0.08)",
                  border: "1px solid rgba(28,20,19,0.06)",
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
                }}
              >
                <div
                  style={{
                    minWidth: 110,
                    height: 110,
                    borderRadius: 20,
                    background: i === 0 ? gradients.warm : "rgba(214,58,58,0.08)",
                    color: i === 0 ? "#fff" : colors.primary,
                    display: "grid",
                    placeItems: "center",
                    fontFamily: fonts.display,
                    fontWeight: 900,
                    fontSize: 44,
                  }}
                >
                  {h.score}
                </div>
                <p style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 38, margin: 0, color: colors.ink, lineHeight: 1.2 }}>
                  {h.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};