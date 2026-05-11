import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors, gradients } from "../theme";
import { fonts, fadeUp } from "../MainVideo";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const POSTS = [
  { day: 0, title: "Reel: morning routine", color: gradients.warm, h: 110 },
  { day: 1, title: "Carousel: 5 hook formulas", color: "rgba(232,122,168,0.85)", h: 130 },
  { day: 2, title: "Story: BTS film day", color: "rgba(244,184,96,0.9)", h: 80 },
  { day: 3, title: "Reel: trending audio", color: gradients.warm, h: 100 },
  { day: 4, title: "Brand pitch send", color: "rgba(28,20,19,0.92)", h: 90 },
  { day: 5, title: "Restock day", color: "rgba(157,217,184,0.9)", h: 70 },
  { day: 6, title: "Off · recharge", color: "rgba(28,20,19,0.06)", h: 60, dim: true },
];

export const ScenePlanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = fadeUp(frame, fps, 4);

  return (
    <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", width: "100%" }}>
        <div style={{ ...head, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: colors.primary, margin: 0 }}>
              Plan your week
            </p>
            <h2 style={{ fontFamily: fonts.display, fontSize: 110, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, margin: "12px 0 0" }}>
              A week of content. <span style={{ fontStyle: "italic", color: colors.primary }}>Mapped.</span>
            </h2>
          </div>
          <div style={{ background: colors.ink, color: "#fff", padding: "16px 24px", borderRadius: 14, fontWeight: 700, fontSize: 22 }}>
            7 posts queued
          </div>
        </div>

        <div
          style={{
            marginTop: 70,
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 18,
            background: "#fff",
            borderRadius: 28,
            padding: 32,
            boxShadow: "0 20px 50px rgba(28,20,19,0.1)",
            border: "1px solid rgba(28,20,19,0.06)",
          }}
        >
          {DAYS.map((d, i) => {
            const post = POSTS[i];
            const s = spring({ frame: frame - (16 + i * 6), fps, config: { damping: 16, stiffness: 140 } });
            return (
              <div key={d} style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 360 }}>
                <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: colors.inkSoft, margin: 0 }}>
                  {d}
                </p>
                <div
                  style={{
                    background: post.color,
                    color: post.dim ? colors.inkSoft : "#fff",
                    borderRadius: 16,
                    padding: 18,
                    minHeight: post.h,
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1.25,
                    transform: `scale(${interpolate(s, [0, 1], [0.6, 1])}) translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                    opacity: s,
                    transformOrigin: "top center",
                  }}
                >
                  {post.title}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 40, fontSize: 28, color: colors.inkSoft, fontWeight: 600, textAlign: "center" }}>
          Drag, drop, done. Never stare at a blank week again.
        </p>
      </div>
    </AbsoluteFill>
  );
};