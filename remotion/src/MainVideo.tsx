import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { colors, gradients } from "./theme";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneIdea } from "./scenes/SceneIdea";
import { SceneHooks } from "./scenes/SceneHooks";
import { ScenePlanner } from "./scenes/ScenePlanner";
import { SceneMonetise } from "./scenes/SceneMonetise";
import { SceneOutro } from "./scenes/SceneOutro";

const display = loadDisplay("normal", { weights: ["700", "900"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const fonts = {
  display: display.fontFamily,
  body: body.fontFamily,
};

function PersistentBg() {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 30;
  const drift2 = Math.cos(frame / 80) * 40;
  return (
    <AbsoluteFill style={{ background: colors.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -200,
          background: `radial-gradient(60% 50% at ${30 + drift}% ${30 + drift2}%, ${colors.coral}55, transparent 60%), radial-gradient(50% 50% at ${75 - drift}% ${70 + drift2}%, ${colors.pink}44, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      {/* film grain dots */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #000 1px, transparent 1px), radial-gradient(circle at 70% 70%, #000 1px, transparent 1px)",
          backgroundSize: "60px 60px, 80px 80px",
        }}
      />
    </AbsoluteFill>
  );
}

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: fonts.body, color: colors.ink }}>
      <PersistentBg />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={75}>
          <SceneIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneIdea />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneHooks />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <ScenePlanner />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneMonetise />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Shared helpers exported for scenes
export function easeOutSpring(frame: number, fps: number, delay = 0) {
  return spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } });
}

export function fadeUp(frame: number, fps: number, delay = 0) {
  const s = easeOutSpring(frame, fps, delay);
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [28, 0])}px)`,
  };
}