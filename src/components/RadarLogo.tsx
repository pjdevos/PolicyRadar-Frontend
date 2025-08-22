// components/RadarLogo.tsx
import React from "react";

type RadarLogoProps = {
  size?: number;          // px, default 56
  beamStartDeg?: number;  // beginhoek (deg), default -90 (naar boven)
  beamWidthDeg?: number;  // breedte van de sweep, default 25
  spinDuration?: number;  // seconden per rotatie, default 2.4
  rotations?: number;     // aantal rotaties, default 2
  showRim?: boolean;      // witte rand, default true
};

export default function RadarLogo({
  size = 56,
  beamStartDeg = -90,
  beamWidthDeg = 25,
  spinDuration = 2.4,
  rotations = 2,
  showRim = true,
}: RadarLogoProps) {
  const total = 360 * rotations;

  const keyframes = `
    @keyframes pr-spin { to { transform: rotate(${total}deg); } }
  `;

  const beam = `conic-gradient(
    from ${beamStartDeg}deg,
    rgba(120,170,255,.55) 0deg,
    rgba(77,163,255,.95) ${Math.max(8, beamWidthDeg - 15)}deg,
    rgba(77,163,255,0) ${beamWidthDeg}deg,
    rgba(77,163,255,0) 360deg
  )`;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        isolation: "isolate",
        background:
          "radial-gradient(80% 80% at 45% 40%, #0c3a8a 0%, #003399 64%, #002a80 100%)",
        boxShadow:
          "0 0 0 6px rgba(77,163,255,.12), 0 1px 0 rgba(255,255,255,.3) inset, 0 10px 24px rgba(0,0,0,.35)",
        display: "inline-block",
      }}
      aria-label="Policy Radar logo"
      role="img"
    >
      <style>{keyframes}</style>

      {/* optionele lichte rim */}
      {showRim && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            boxShadow: "0 0 0 2px rgba(255,255,255,.65) inset",
          }}
        />
      )}

      {/* sweep — 2 lagen voor twee nette rotaties en dan stoppen */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: beam,
          animation: `pr-spin ${spinDuration}s linear 1 forwards`,
          filter: "drop-shadow(0 0 8px rgba(77,163,255,.45))",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: beam,
          animation: `pr-spin ${spinDuration}s ${spinDuration}s linear 1 forwards`,
          filter: "drop-shadow(0 0 8px rgba(77,163,255,.45))",
        }}
      />

      {/* 12 sterren — statisch, zonder scripts */}
      <StarsOverlay />
    </div>
  );
}

function StarsOverlay() {
  // exacte EU-plaatsing: ringradius 512/3, sterradius 512/18, punt omhoog
  const H = 512;
  const Rc = H / 3; // 170.6667
  const Rs = H / 18; // 28.4444

  // genormaliseerde ster (outer radius = 1)
  const starUnitPath = `
    M 0,-1
    L 0.2245,-0.3090
    L 0.9511,-0.3090
    L 0.3633,0.1180
    L 0.5878,0.8090
    L 0,0.3819
    L -0.5878,0.8090
    L -0.3633,0.1180
    L -0.9511,-0.3090
    L -0.2245,-0.3090
    Z
  `;

  const copies = Array.from({ length: 12 }, (_, i) => {
    const rotate = -90 + i * 30; // start bovenaan, met 30° stappen
    // plaats één ster door center → rotate → omhoog op ring → scale
    const transform = `translate(256,256) rotate(${rotate}) translate(0,-${Rc}) scale(${Rs})`;
    return (
      <use key={i} href="#pr-star" transform={transform} />
    );
  });

  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <path id="pr-star" d={starUnitPath} />
      </defs>
      <g fill="#FFCC00" stroke="#0b2f74" strokeWidth={6} vectorEffect="non-scaling-stroke">
        {copies}
      </g>
    </svg>
  );
}