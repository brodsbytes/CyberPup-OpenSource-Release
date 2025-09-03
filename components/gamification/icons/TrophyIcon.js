import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const TrophyIcon = ({ size = 24, animated = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FCD34D" />
        <Stop offset="50%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
      <LinearGradient id="trophyShine" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FEF3C7" />
        <Stop offset="100%" stopColor="#FCD34D" />
      </LinearGradient>
    </Defs>

    {/* Glow base for visibility */}
    <Path
      d="M6 3 L18 3 L18 12 L15 15 L9 15 L6 12 Z"
      fill="#FCD34D"
      opacity="0.3"
    />

    {/* Main trophy cup - larger and more defined */}
    <Path
      d="M7 4 L17 4 L17 11 L15 13 L9 13 L7 11 Z"
      fill="url(#trophyGradient)"
      stroke="#FCD34D"
      strokeWidth="0.5"
    />

    {/* Trophy handles - more prominent */}
    <Path
      d="M6 6 Q4 6 4 8 Q4 10 6 10"
      fill="none"
      stroke="url(#trophyGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M18 6 Q20 6 20 8 Q20 10 18 10"
      fill="none"
      stroke="url(#trophyGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Trophy stem */}
    <Rect x="11" y="13" width="2" height="4" fill="url(#trophyGradient)" />

    {/* Trophy base - more substantial */}
    <Rect x="8" y="17" width="8" height="3" rx="1.5" fill="url(#trophyGradient)" stroke="#FCD34D" strokeWidth="0.3" />
    <Rect x="7" y="20" width="10" height="1.5" rx="0.75" fill="url(#trophyGradient)" opacity="0.8" />

    {/* Shine effects - multiple for better visibility */}
    <Path
      d="M9 6 L11 4 L13 6 L11 8 Z"
      fill="url(#trophyShine)"
      opacity="0.8"
    >
      {animated && (
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
      )}
    </Path>

    {/* Additional shine lines */}
    <Rect x="10" y="7" width="4" height="0.5" rx="0.25" fill="#FEF3C7" opacity="0.6" />
    <Rect x="9" y="9" width="6" height="0.5" rx="0.25" fill="#FEF3C7" opacity="0.4" />

    {/* Small star detail */}
    <Path
      d="M12 8 L12.5 9 L13.5 9 L12.8 9.7 L13 10.5 L12 10 L11 10.5 L11.2 9.7 L10.5 9 L11.5 9 Z"
      fill="#FEF3C7"
      opacity="0.9"
    />
  </Svg>
);

export default TrophyIcon;
