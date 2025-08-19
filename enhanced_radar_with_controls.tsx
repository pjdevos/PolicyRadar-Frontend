import React, { useState, useEffect } from "react";

type AnimationType = 'sweep' | 'continuous' | 'startup' | 'alert' | 'pause';

interface RadarLogoProps {
  size?: string;
  animationType?: AnimationType;
  intensity?: 'low' | 'medium' | 'high';
  autoStart?: boolean;
  onScanComplete?: () => void;
}

export default function RadarLogo({ 
  size = "w-64 h-64",
  animationType = 'sweep',
  intensity = 'high',
  autoStart = true,
  onScanComplete
}: RadarLogoProps) {
  const [isScanning, setIsScanning] = useState(autoStart);
  const [scanCount, setScanCount] = useState(0);

  // Animation class mapping
  const animationClasses = {
    sweep: 'animate-radar-sweep',
    continuous: 'animate-radar-continuous', 
    startup: 'animate-radar-startup',
    alert: 'animate-radar-alert',
    pause: ''
  };

  const intensityClasses = {
    low: 'radar-sweep-intensity-low',
    medium: 'radar-sweep-intensity-medium', 
    high: 'radar-sweep-intensity-high'
  };

  // Handle animation end
  useEffect(() => {
    if (animationType === 'sweep' || animationType === 'startup') {
      const timer = setTimeout(() => {
        setIsScanning(false);
        setScanCount(prev => prev + 1);
        onScanComplete?.();
      }, animationType === 'sweep' ? 10000 : 8000);

      return () => clearTimeout(timer);
    }
  }, [isScanning, animationType, onScanComplete]);

  const startScan = () => {
    setIsScanning(true);
  };

  const getCurrentAnimation = () => {
    if (!isScanning) return '';
    return animationClasses[animationType];
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Radar */}
      <div className={`relative ${size} group cursor-pointer`} onClick={startScan}>
        {/* Background rings */}
        <div className="absolute inset-4 rounded-full border border-blue-300/20 animate-pulse"></div>
        <div className="absolute inset-8 rounded-full border border-blue-300/15"></div>
        <div className="absolute inset-12 rounded-full border border-blue-300/10"></div>
        
        {/* Radar sweep */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 ${getCurrentAnimation()} ${intensityClasses[intensity]}`}
          style={{
            background: intensity === 'high' 
              ? "conic-gradient(from 0deg, rgba(0,51,153,0.9), rgba(0,51,153,0.3) 45deg, transparent 90deg)"
              : intensity === 'medium'
              ? "conic-gradient(from 0deg, rgba(0,51,153,0.7), rgba(0,51,153,0.2) 45deg, transparent 90deg)"
              : "conic-gradient(from 0deg, rgba(0,51,153,0.5), rgba(0,51,153,0.1) 45deg, transparent 90deg)"
          }}
        ></div>

        {/* Base disc */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 opacity-80 shadow-2xl shadow-blue-500/20"></div>
        
        {/* Center highlight */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-400/20 to-transparent"></div>

        {/* EU Stars */}
        <svg className="absolute inset-0 w-full h-full drop-shadow-md" viewBox="0 0 512 512">
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
                className={`transition-all duration-300 ${isScanning ? 'animate-pulse' : ''}`}
                style={{
                  filter: "drop-shadow(0 0 3px rgba(255, 204, 0, 0.6))"
                }}
              />
            );
          })}
        </svg>

        {/* Status indicator */}
        <div className="absolute top-4 right-4">
          <div className={`w-3 h-3 rounded-full ${
            isScanning 
              ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' 
              : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
          }`}></div>
        </div>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs font-bold text-yellow-300 tracking-wider opacity-90">
              POLICY
            </div>
            <div className="text-lg font-bold text-white -mt-1">
              RADAR
            </div>
            {scanCount > 0 && (
              <div className="text-xs text-blue-300 mt-1">
                Scans: {scanCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-2 text-sm">
        <button
          onClick={startScan}
          disabled={isScanning}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            isScanning 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </button>
        
        <div className="flex items-center space-x-1 text-gray-600">
          <span className="text-xs">Mode:</span>
          <span className="text-xs font-medium capitalize">{animationType}</span>
        </div>
      </div>
    </div>
  );
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