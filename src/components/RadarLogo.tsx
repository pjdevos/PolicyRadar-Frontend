import React from "react";

type Props = {
  size?: number;       // px
  durationSec?: number; // totale duur voor 1 rotatie
  rotations?: number;   // aantal rotaties, default 2
  startAngle?: number;  // beginhoek in graden
};

export default function RadarLogo({
  size = 48,
  durationSec = 3,
  rotations = 2,
  startAngle = 0,
}: Props) {
  const outer = size;
  const starCircleR = 512 / 3;
  const starR = 512 / 18;

  // Genereer 12 sterren in JSX, geen <script> nodig
  const stars = Array.from({ length: 12 }).map((_, i) => {
    const angle = ((i * 30) - 90) * (Math.PI / 180);
    const cx = 256 + starCircleR * Math.cos(angle);
    const cy = 256 + starCircleR * Math.sin(angle);
    return (
      <polygon key={i} points={starPoints(cx, cy, starR)} fill="#FFCC00" />
    );
  });

  // CSS voor 2 rotaties en stoppen
  const totalDeg = 360 * rotations;
  const anim = `
    @keyframes radar-spin { to { transform: rotate(${totalDeg}deg); } }
  `;

  return (
    <div
      style={{
        width: outer,
        height: outer,
        position: "relative",
        borderRadius: "50%",
        overflow: "hidden",       // belangrijk
        isolation: "isolate",
        boxShadow: "0 0 0 6px rgba(0,51,153,0.14)",
      }}
      aria-label="Radar logo"
    >
      <style>{anim}</style>

      {/* Blauwe basis */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#003399",
          opacity: 0.72,
        }}
      />

      {/* Sweep: conic-gradient, 2 rotaties dan stop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from ${startAngle}deg, rgba(0,51,153,1) 0deg, rgba(0,51,153,0) 359deg, rgba(0,51,153,0) 360deg)`,
          animation: `radar-spin ${durationSec}s linear ${rotations} forwards`,
          filter: "drop-shadow(0 0 4px rgba(0,51,153,.45))",
        }}
      />

      {/* Sterren als pure SVG */}
      <svg
        viewBox="0 0 512 512"
        role="img"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      >
        {stars}
      </svg>
    </div>
  );
}

// helper: 5-puntige ster
function starPoints(cx: number, cy: number, r: number) {
  const inner = r * 0.382;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : inner;
    const x = cx + rad * Math.cos(a);
    const y = cy - rad * Math.sin(a);
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
}