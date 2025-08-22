import React from "react";

// Helper function: five-pointed star
function starPoints(cx: number, cy: number, r: number) {
  const innerR = r * 0.382;
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : innerR;
    const x = cx + rr * Math.cos(angle);
    const y = cy - rr * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points;
}

// Fixed size RadarLogo with slow spin animation
export default function RadarLogo() {
  return (
    <div className="relative w-64 h-64">
      <div className="absolute inset-0 rounded-full animate-spin-slow"
           style={{background: "conic-gradient(from 0deg, rgba(0,51,153,1), rgba(0,51,153,0) 30deg, transparent 360deg)"}}>
      </div>
      <div className="absolute inset-0 rounded-full bg-[#003399] opacity-70"></div>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 512 512">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const radius = 512 / 3;
          const cx = 256 + radius * Math.cos(angle);
          const cy = 256 + radius * Math.sin(angle);
          return (
            <polygon
              key={i}
              points={starPoints(cx, cy, 512 / 18).join(" ")}
              fill="#FFCC00"
            />
          );
        })}
      </svg>
    </div>
  );
}