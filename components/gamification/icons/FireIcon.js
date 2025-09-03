import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const FireIcon = ({ size = 24, animated = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FB923C" />
        <Stop offset="50%" stopColor="#F97316" />
        <Stop offset="100%" stopColor="#EA580C" />
      </LinearGradient>
    </Defs>

    {/* Glow base */}
    <Path
      d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"
      fill="#FB923C"
      opacity="0.4"
    />

    {/* Main flame */}
    <Path
      d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"
      fill="url(#fireGradient)"
      opacity="1"
    >
      {animated && (
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="scale"
          values="1;1.1;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      )}
    </Path>
  </Svg>
);

export default FireIcon;
