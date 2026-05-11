import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors, gradients } from "../theme";
import { fonts, fadeUp } from "../MainVideo";

const HOOK = "I tried posting at 6am for 30 days. Here's what changed…";

export const SceneIdea: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = fadeUp(frame, fps, 4);
  const labelS = fadeUp(frame, fps, 12);
  // typewriter
  const charCount = Math.floor(interpolate(frame, [22, 70], [0, HOOK.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const typed = HOOK.slice(0, charCount);
  const cursor = Math.floor(frame / 8) % 2 === 0;
  const tags = fadeUp(frame, fps, 70);
  const cta = fadeUp(frame, fps, 84);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div
        style={{
          width: "100%",
          maxWidth: 1400,
          background: "#fff",
          borderRadius: 36,
          padding: 56,
          boxShadow: "0 30px 80px rgba(28,20,19,0.12), 0 4px 12px rgba(28,20,19,0.06)",
          border: `1px solid rgba(28,20,19,0.08)`,
          ...card,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, ...labelS }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: gradients.warm,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 22,
            }}
          >
            ✦
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: colors.inkSoft }}>
            Today's idea · just for you
          </span>
        </div>

        <p
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 84,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "32px 0 0",
            color: colors.ink,
          }}
        >
          “{typed}
          <span style={{ opacity: cursor ? 1 : 0, color: colors.primary }}>|</span>
          {charCount >= HOOK.length ? "”" : ""}
        </p>

        <div style={{ display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap", ...tags }}>
          {[
            { label: "Reel · 30s", bg: colors.ink, fg: "#fff" },
            { label: "Hook works because it promises a clear before/after", bg: "rgba(28,20,19,0.06)", fg: colors.inkSoft },
          ].map((t) => (
            <span
              key={t.label}
              style={{
                background: t.bg,
                color: t.fg,
                padding: "12px 20px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {t.label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 40, ...cta }}>
          <button
            style={{
              background: colors.ink,
              color: "#fff",
              border: 0,
              padding: "20px 32px",
              borderRadius: 14,
              fontSize: 24,
              fontWeight: 700,
              fontFamily: fonts.body,
            }}
          >
            Build the script →
          </button>
          <button
            style={{
              background: "transparent",
              color: colors.ink,
              border: 0,
              padding: "20px 24px",
              fontSize: 22,
              fontWeight: 600,
              fontFamily: fonts.body,
            }}
          >
            Try another
          </button>
        </div>
      </div>

      <p style={{ fontSize: 28, color: colors.inkSoft, marginTop: 36, fontWeight: 600, ...cta }}>
        A fresh, on-brand idea waiting every morning.
      </p>
    </AbsoluteFill>
  );
};