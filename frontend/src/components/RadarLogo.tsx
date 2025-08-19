import React, { useEffect } from 'react';
import { Radio, Activity, Target, Zap } from 'lucide-react';

interface RadarLogoProps {
  size?: number;
  className?: string;
  animationType?: 'sweep' | 'pulse' | 'ping' | 'glow' | 'static';
  showPulseRings?: boolean;
  color?: string;
  glowColor?: string;
}

const RadarLogo: React.FC<RadarLogoProps> = ({
  size = 24,
  className = '',
  animationType = 'pulse',
  showPulseRings = true,
  color = 'currentColor',
  glowColor = 'rgba(59, 130, 246, 0.5)'
}) => {
  useEffect(() => {
    // Optional: Control animation state based on props or external state
    const interval = setInterval(() => {
      if (animationType === 'sweep') {
        // Could add sweep-specific logic here if needed
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [animationType]);

  const getAnimationClass = () => {
    switch (animationType) {
      case 'sweep':
        return 'radar-sweep';
      case 'pulse':
        return 'radar-pulse';
      case 'ping':
        return 'radar-ping';
      case 'glow':
        return 'radar-glow';
      case 'static':
      default:
        return '';
    }
  };

  const getRadarIcon = () => {
    switch (animationType) {
      case 'sweep':
        return <Radio style={{ width: size, height: size, color }} />;
      case 'pulse':
        return <Activity style={{ width: size, height: size, color }} />;
      case 'ping':
        return <Target style={{ width: size, height: size, color }} />;
      case 'glow':
        return <Zap style={{ width: size, height: size, color }} />;
      case 'static':
      default:
        return <Radio style={{ width: size, height: size, color }} />;
    }
  };

  const containerStyle = {
    width: size,
    height: size,
    position: 'relative' as const,
    display: 'inline-block' as const,
  };

  const glowStyle = animationType === 'glow' ? {
    filter: `drop-shadow(0 0 ${size * 0.2}px ${glowColor})`,
    borderRadius: '50%',
  } : {};

  return (
    <div 
      className={`radar-container ${className}`} 
      style={containerStyle}
    >
      {/* Main radar icon */}
      <div 
        className={`radar-fade-in ${getAnimationClass()}`}
        style={glowStyle}
      >
        {getRadarIcon()}
      </div>

      {/* Pulse rings for enhanced effect */}
      {showPulseRings && (animationType === 'ping' || animationType === 'pulse') && (
        <>
          <div 
            className="radar-circle" 
            style={{ 
              borderColor: color,
              opacity: 0.3,
            }}
          />
          <div 
            className="radar-circle" 
            style={{ 
              borderColor: color,
              opacity: 0.2,
            }}
          />
          <div 
            className="radar-circle" 
            style={{ 
              borderColor: color,
              opacity: 0.1,
            }}
          />
        </>
      )}

      {/* Sweep line for radar sweep animation */}
      {animationType === 'sweep' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '2px',
            height: size * 0.4,
            background: `linear-gradient(to bottom, ${color}, transparent)`,
            transformOrigin: 'bottom center',
            transform: 'translate(-50%, -100%)',
            opacity: 0.8,
          }}
          className="radar-sweep"
        />
      )}
    </div>
  );
};

export default RadarLogo;