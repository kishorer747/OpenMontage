import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { ThemeConfig } from "../Root";

/**
 * CinematicBackground3D — rich animated backdrop with:
 *  - Deep moving radial + linear gradient base
 *  - 3D perspective grid floor + ceiling scrolling toward camera
 *  - Rotating wireframe cube centered
 *  - Parallax glow orbs (screen-blend mix)
 *  - Twinkling starfield
 *  - Horizontal scan-line sweep
 *  - Vignette
 */
export const CinematicBackground3D: React.FC<{ theme: ThemeConfig }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // seconds

  const primary = theme.primaryColor;
  const accent = theme.accentColor;
  const bg = theme.backgroundColor;
  const surface = theme.surfaceColor;

  // Two moving radial gradients
  const rg1x = 20 + Math.sin(t / 8) * 30;
  const rg1y = 30 + Math.cos(t / 6) * 25;
  const rg2x = 70 + Math.cos(t / 7) * 25;
  const rg2y = 70 + Math.sin(t / 9) * 20;
  const angle = (t * 5) % 360;

  const backdrop = `
    radial-gradient(ellipse at ${rg1x}% ${rg1y}%, ${primary}55 0%, transparent 45%),
    radial-gradient(ellipse at ${rg2x}% ${rg2y}%, ${accent}44 0%, transparent 50%),
    linear-gradient(${angle}deg, ${bg} 0%, ${surface} 45%, ${bg} 100%)
  `;

  // 3D perspective grid motion (forward)
  const gridTz = (t * 60) % 600;

  // Cube rotation
  const cubeRx = t * 18;
  const cubeRy = t * 14;

  // Parallax orbs (6)
  const orbColors = [primary, accent, "#22D3EE", "#F472B6", "#34D399", "#F59E0B"];
  const orbs = Array.from({ length: 6 }, (_, i) => {
    const seed = i + 1;
    const baseX = (seed * 173) % 100;
    const baseY = (seed * 271) % 100;
    const driftX = Math.sin(t / (3 + seed)) * 15;
    const driftY = Math.cos(t / (4 + seed)) * 10;
    const size = 280 + ((seed * 47) % 240);
    return {
      baseX,
      baseY,
      driftX,
      driftY,
      size,
      color: orbColors[i % orbColors.length],
    };
  });

  // Starfield (deterministic)
  const stars = Array.from({ length: 80 }, (_, i) => {
    const x = (i * 97) % 100;
    const y = (i * 53) % 100;
    const s = (i % 3) + 1;
    const tw = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 1.4 + i));
    return { x, y, s, tw };
  });

  // Scan sweep Y position (cycles top to bottom)
  const scanY = ((t * 9) % 120) - 10;

  // Rotating ring
  const ringRot = t * 25;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: backdrop }}>
      {/* Starfield */}
      {stars.map((st, i) => (
        <div
          key={`s${i}`}
          style={{
            position: "absolute",
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            borderRadius: "50%",
            background: "#FFFFFF",
            opacity: st.tw * 0.55,
            boxShadow: `0 0 ${st.s * 3}px #FFFFFF`,
          }}
        />
      ))}

      {/* Parallax glow orbs */}
      {orbs.map((o, i) => (
        <div
          key={`o${i}`}
          style={{
            position: "absolute",
            left: `calc(${o.baseX}% + ${o.driftX}vw)`,
            top: `calc(${o.baseY}% + ${o.driftY}vh)`,
            width: o.size,
            height: o.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${o.color}99 0%, ${o.color}00 70%)`,
            filter: "blur(24px)",
            transform: "translate(-50%, -50%)",
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* 3D perspective grid — FLOOR */}
      <AbsoluteFill style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "absolute",
            left: "-50%",
            right: "-50%",
            bottom: "0%",
            height: "120%",
            transform: `rotateX(70deg) translateZ(${gridTz}px)`,
            transformStyle: "preserve-3d",
            backgroundImage: `
              linear-gradient(${accent}66 1px, transparent 1px),
              linear-gradient(90deg, ${accent}66 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            opacity: 0.45,
          }}
        />
      </AbsoluteFill>

      {/* 3D perspective grid — CEILING */}
      <AbsoluteFill style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "absolute",
            left: "-50%",
            right: "-50%",
            top: "0%",
            height: "120%",
            transform: `rotateX(-70deg) translateZ(${gridTz}px)`,
            transformStyle: "preserve-3d",
            backgroundImage: `
              linear-gradient(${primary}55 1px, transparent 1px),
              linear-gradient(90deg, ${primary}55 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            opacity: 0.3,
          }}
        />
      </AbsoluteFill>

      {/* Rotating wireframe cube */}
      <AbsoluteFill
        style={{
          perspective: "1400px",
          perspectiveOrigin: "50% 50%",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 700,
            height: 700,
            transform: `translate(-50%,-50%) rotateX(${cubeRx}deg) rotateY(${cubeRy}deg)`,
            transformStyle: "preserve-3d",
            opacity: 0.22,
          }}
        >
          {[
            "translateZ(350px)",
            "translateZ(-350px)",
            "rotateY(90deg) translateZ(350px)",
            "rotateY(-90deg) translateZ(350px)",
            "rotateX(90deg) translateZ(350px)",
            "rotateX(-90deg) translateZ(350px)",
          ].map((tr, fi) => (
            <div
              key={fi}
              style={{
                position: "absolute",
                width: 700,
                height: 700,
                transform: tr,
                border: `2px solid ${accent}`,
                boxShadow: `0 0 60px ${accent}`,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>

      {/* Rotating ring (2D, large, low-opacity) */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 1400,
            height: 1400,
            borderRadius: "50%",
            border: `2px dashed ${primary}88`,
            transform: `translate(-50%,-50%) rotate(${ringRot}deg)`,
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 1900,
            height: 1900,
            borderRadius: "50%",
            border: `1px solid ${accent}66`,
            transform: `translate(-50%,-50%) rotate(${-ringRot * 0.6}deg)`,
            opacity: 0.28,
          }}
        />
      </AbsoluteFill>

      {/* Scan-line sweep */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${scanY}%`,
          height: "10%",
          background: `linear-gradient(to bottom, transparent, ${accent}33, transparent)`,
          filter: "blur(6px)",
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
