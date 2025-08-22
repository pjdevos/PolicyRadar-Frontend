// components/RadarLogo.tsx
import React from "react";

/**
 * CSS requirements:
 * - include policy_radar.css (classes .pr-logo, .pr-logo__rim, .pr-logo__sweep, .pr-logo__sweep2, @keyframes pr-spin)
 * Usage:
 *   <RadarLogo size={56} startDeg={-90} />
 */
type Props = {
  size?: number;     // px, default 56
  startDeg?: number; // start angle in degrees, default -90 (up)
};

export default function RadarLogo({ size = 56, startDeg = -90 }: Props) {
  // CSS beam uses from -90deg by default; tweak by rotating the sweep container
  const rotateStyle: React.CSSProperties = { transform: `rotate(${startDeg + 90}deg)` };

  return (
    <div
      className="pr-logo"
      style={{ width: size, height: size }}
      aria-label="Policy Radar logo"
      role="img"
    >
      <div className="pr-logo__rim" />
      {/* Wrap the sweeps in a rotator so we can adjust startDeg via CSS transform */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", ...rotateStyle }}>
        <div className="pr-logo__sweep" />
        <div className="pr-logo__sweep2" />
      </div>

      {/* Static 12 stars (no scripts), EU placement */}
      <svg viewBox="0 0 512 512" aria-hidden="true">
        <defs>
          <path id="pr-starUnit" d="
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
            Z" />
        </defs>
        <g fill="#FFCC00" stroke="#0b2f74" strokeWidth={6} vectorEffect="non-scaling-stroke">
          {/* Rcircle = 512/3, Rstar = 512/18 */}
          {[-90,-60,-30,0,30,60,90,120,150,180,210,240].map((deg, i) => (
            <g key={i} transform={`translate(256,256) rotate(${deg}) translate(0,-170.6667) scale(28.4444)`}>
              <use href="#pr-starUnit" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
