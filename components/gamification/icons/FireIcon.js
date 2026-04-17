import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FireIcon = ({ size = 24, animated = false }) => (
  <MaterialCommunityIcons
    name="fire"
    size={size}
    color="#F97316"
    style={{ opacity: 0.7 }}
  />
);

export default FireIcon;
