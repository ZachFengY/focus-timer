/**
 * AppLogo — FocusFlow brand mark rendered with Skia.
 *
 * Visual concept: a 300° arc ("Focus Ring") that mirrors the in-app
 * TimerRing, with an indigo→lavender sweep gradient and a glowing
 * white endpoint. The 60° gap sits at the top-right (≈ 1-o'clock),
 * suggesting a timer that is almost — but not quite — complete.
 */
import {
  BlurMask,
  Canvas,
  Circle,
  Path,
  Skia,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import { View } from "react-native";

interface AppLogoProps {
  /** Canvas size in dp (logo is square). Default 80. */
  size?: number;
  /** Render a dark rounded-square background (for icon / splash use). */
  showBackground?: boolean;
}

export function AppLogo({ size = 80, showBackground = false }: AppLogoProps) {
  const cx = size / 2;
  const cy = size / 2;

  // Geometry
  const outerR = size * 0.4; // outer arc radius
  const innerR = size * 0.25; // inner faint ring radius
  const strokeW = size * 0.09; // arc stroke width
  const bgRadius = size * 0.24; // background rounded-rect corner

  // ── Main arc: 300° clockwise starting at 60° (1-o'clock gap at top-right) ──
  const arcOval = {
    x: cx - outerR,
    y: cy - outerR,
    width: outerR * 2,
    height: outerR * 2,
  };
  const arcPath = Skia.Path.Make();
  arcPath.addArc(arcOval, 60, 300);

  // ── Inner ring (full circle, very faint) ────────────────────────────────────
  const innerOval = {
    x: cx - innerR,
    y: cy - innerR,
    width: innerR * 2,
    height: innerR * 2,
  };
  const innerPath = Skia.Path.Make();
  innerPath.addArc(innerOval, 0, 360);

  // ── Glowing dot: at the START of the arc (60°) ──────────────────────────────
  const dotRad = (60 * Math.PI) / 180;
  const dotX = cx + outerR * Math.cos(dotRad);
  const dotY = cy + outerR * Math.sin(dotRad);
  const dotR = strokeW * 0.55;

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ width: size, height: size }}>
        {/* ── Dark rounded-square background (optional) ── */}
        {showBackground && (
          <Path
            path={(() => {
              const p = Skia.Path.Make();
              p.addRRect({
                rect: { x: 0, y: 0, width: size, height: size },
                rx: bgRadius,
                ry: bgRadius,
              });
              return p;
            })()}
            color="#0B0B0E"
          />
        )}

        {/* ── Inner faint ring ── */}
        <Path
          path={innerPath}
          style="stroke"
          strokeWidth={strokeW * 0.28}
          color="rgba(99,102,241,0.18)"
        />

        {/* ── Main 300° arc with sweep gradient ── */}
        <Path
          path={arcPath}
          style="stroke"
          strokeWidth={strokeW}
          strokeCap="round"
        >
          <SweepGradient
            c={vec(cx, cy)}
            colors={["#6366F1", "#818CF8", "#C7D2FE", "#A5B4FC", "#6366F1"]}
            start={60}
            end={360}
          />
        </Path>

        {/* ── Glow halo behind dot ── */}
        <Circle cx={dotX} cy={dotY} r={dotR * 2} color="rgba(199,210,254,0.35)">
          <BlurMask blur={dotR * 1.2} style="normal" />
        </Circle>

        {/* ── Solid white dot ── */}
        <Circle cx={dotX} cy={dotY} r={dotR} color="#FFFFFF" />
      </Canvas>
    </View>
  );
}
