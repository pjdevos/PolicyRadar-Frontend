import React from "react";

interface RadarLogoProps {
  size?: number;
  animationType?: 'pulse' | 'ping' | 'radar' | 'sweep';
  color?: string;
  showPulseRings?: boolean;
}

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

const RadarLogo: React.FC<RadarLogoProps> = ({ 
  size = 32, 
  animationType = 'pulse',
  color = '#003399',
  showPulseRings = false 
}) => {
  // For the new radar design with stars, we'll use a larger base size when it's the main logo
  const isMainLogo = size > 64;
  const logoSize = isMainLogo ? 256 : size;
  
  if (isMainLogo && animationType === 'sweep') {
    return (
      <div className="relative" style={{ width: logoSize, height: logoSize }}>
        {/* Sweep that rotates - need to add the animation to CSS */}
        <div
          className="absolute inset-0 rounded-full animate-radar-sweep"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(0,51,153,1), rgba(0,51,153,0) 30deg, transparent 360deg)",
          }}
        ></div>

        {/* Base disc */}
        <div className="absolute inset-0 rounded-full bg-[#003399] opacity-70"></div>

        {/* Stars */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 512 512">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180); // start boven
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

  // Fallback to simple logo for smaller sizes or other animation types
  const baseClasses = "relative flex items-center justify-center";
  
  const getAnimationClass = () => {
    switch (animationType) {
      case 'pulse':
        return 'animate-pulse';
      case 'ping':
        return 'animate-ping';
      case 'radar':
        return 'animate-spin';
      case 'sweep':
        return 'animate-spin';
      default:
        return '';
    }
  };

  return (
    <div 
      className={baseClasses}
      style={{ width: size, height: size }}
    >
      {/* Main radar circle */}
      <div 
        className={`rounded-full ${getAnimationClass()}`}
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: color,
          opacity: 0.8
        }}
      />
      
      {/* Center dot */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.2, 
          height: size * 0.2, 
          backgroundColor: color,
          opacity: 1
        }}
      />
      
      {/* Pulse rings */}
      {showPulseRings && (
        <>
          <div 
            className="absolute rounded-full border-2 animate-ping"
            style={{ 
              width: size * 1.5, 
              height: size * 1.5, 
              borderColor: color,
              opacity: 0.3
            }}
          />
          <div 
            className="absolute rounded-full border-2 animate-ping"
            style={{ 
              width: size * 2, 
              height: size * 2, 
              borderColor: color,
              opacity: 0.1,
              animationDelay: '0.5s'
            }}
          />
        </>
      )}
    </div>
  );
};

export default RadarLogo;