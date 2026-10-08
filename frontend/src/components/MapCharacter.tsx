import React, { useMemo } from 'react';

interface MapCharacterProps {
  x: number;
  y: number;
  name: string;
  teamId?: string;
  isLocal?: boolean;
}

export default function MapCharacter({ x, y, name, teamId, isLocal = false }: MapCharacterProps) {
  const characterImage = useMemo(() => {
    // Pick red, white, or orange consistently based on teamId
    const colors = ['red', 'white', 'orange'];
    if (!teamId) return '/red.png';
    const charCodeSum = teamId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const color = colors[charCodeSum % colors.length];
    return `/${color}.png`;
  }, [teamId]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -100%)',
        transition: isLocal ? 'none' : 'left 0.1s linear, top 0.1s linear',
        zIndex: Math.floor(y), // Sort by Y axis to appear behind/in front properly
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none', // Prevent intercepting clicks
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          color: isLocal ? '#4ade80' : '#fff',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '9px',
          fontFamily: "'JetBrains Mono', monospace",
          whiteSpace: 'nowrap',
          marginBottom: '2px',
          border: isLocal ? '1px solid #4ade80' : 'none',
        }}
      >
        {name}
      </div>
      <img
        src={characterImage}
        alt="character"
        style={{
          width: '24px',
          height: '24px',
          objectFit: 'contain',
          filter: isLocal ? 'drop-shadow(0 0 5px rgba(74, 222, 128, 0.8))' : 'none',
        }}
      />
    </div>
  );
}
