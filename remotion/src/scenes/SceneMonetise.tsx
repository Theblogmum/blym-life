import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors, gradients } from "../theme";
import { fonts, fadeUp } from "../MainVideo";

function CountUp({ from, to, delay = 0, prefix = "", suffix = "" }: { from: number; to: number; delay?: number; prefix?: string; suffix?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: 60, mass: 1 } });
  const v = Math.round(interpolate(s, [0, 1], [from, to]));
  return <span>{prefix}{v.toLocaleString()}{suffix}</span>;
}

export const SceneMonetise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = fadeUp(frame, fps, 4);
  const cards = [
    { label: "Brand pitch sent", value: "Glossier", time: "2 min ago", accent: gradients.warm },
    { label: "Invoice paid", value: "£1,800", time: "12 min ago", accent: gradients.bloom },
    { label: "Affiliate link click", value: "+47", time: "Today", accent: "rgba(28,20,19,0.92)" },
  ];

  return (
    <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 70, alignItems: "center" }}>
        <div style={{ ...head }}>
          <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: colors.primary, margin: 0 }}>
            Make it pay
          </p>
          <h2 style={{ fontFamily: fonts.display, fontSize: 100, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, margin: "12px 0 0" }}>
            Turn followers into <span style={{ fontStyle: "italic", color: colors.primary }}>income.</span>
          </h2>

          <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ ...fadeUp(frame, fps, 30) }}>
              <p style={{ fontSize: 26, color: colors.inkSoft, margin: 0, fontWeight: 600 }}>This month so far</p>
              <p style={{ fontFamily: fonts.display, fontSize: 130, fontWeight: 900, lineHeight: 1, margin: "8px 0 0", color: colors.ink, letterSpacing: "-0.04em" }}>
                <CountUp from={0} to={4280} delay={36} prefix="£" />
              </p>
            </div>
            <div style={{ display: "flex", gap: 40, ...fadeUp(frame, fps, 60) }}>
              <Stat label="Pitches sent" value={<CountUp from={0} to={28} delay={66} />} />
              <Stat label="Conversions" value={<CountUp from={0} to={9} delay={70} />} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {cards.map((c, i) => {
            const s = spring({ frame: frame - (24 + i * 14), fps, config: { damping: 18, stiffness: 140 } });
            return (
              <div
                key={c.label}
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  padding: 28,
                  boxShadow: "0 16px 40px rgba(28,20,19,0.1)",
                  border: "1px solid rgba(28,20,19,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  transform: `translateX(${interpolate(s, [0, 1], [80, 0])}px)`,
                  opacity: s,
                }}
              >
                <div style={{ width: 70, height: 70, borderRadius: 18, background: c.accent }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.inkSoft, margin: 0 }}>
                    {c.label}
                  </p>
                  <p style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 40, margin: "6px 0 0", color: colors.ink, lineHeight: 1 }}>
                    {c.value}
                  </p>
                </div>
                <p style={{ fontSize: 18, color: colors.inkSoft, margin: 0, fontWeight: 600 }}>{c.time}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.inkSoft, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: fonts.display, fontSize: 56, fontWeight: 900, color: colors.ink, margin: "4px 0 0", lineHeight: 1 }}>{value}</p>
    </div>
  );
}