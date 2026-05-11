import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors, gradients } from "../theme";
import { fonts, fadeUp } from "../MainVideo";

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const eyebrowS = fadeUp(frame, fps, 6);
  const titleS = fadeUp(frame, fps, 14);
  const subS = fadeUp(frame, fps, 26);
  const lineW = interpolate(spring({ frame: frame - 18, fps, config: { damping: 200 } }), [0, 1], [0, 100]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 100 }}>
      <div style={{ textAlign: "center", maxWidth: 1400 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 22px",
            borderRadius: 999,
            background: "rgba(28,20,19,0.06)",
            color: colors.inkSoft,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            ...eyebrowS,
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: gradients.warm,
              display: "inline-block",
              transform: `scale(${logo}) rotate(${interpolate(logo, [0, 1], [-30, 0])}deg)`,
              boxShadow: "0 8px 24px rgba(214,58,58,0.4)",
            }}
          />
          Blym · For creators
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: 200,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            margin: "40px 0 0",
            color: colors.ink,
            ...titleS,
          }}
        >
          Post like a{" "}
          <span
            style={{
              background: gradients.warm,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontStyle: "italic",
            }}
          >
            pro.
          </span>
        </h1>
        <div
          style={{
            margin: "30px auto 0",
            height: 3,
            width: `${lineW}%`,
            maxWidth: 200,
            background: colors.primary,
          }}
        />
        <p
          style={{
            fontSize: 38,
            color: colors.inkSoft,
            margin: "36px 0 0",
            fontWeight: 500,
            ...subS,
          }}
        >
          Without spending all day glued to your phone.
        </p>
      </div>
    </AbsoluteFill>
  );
};