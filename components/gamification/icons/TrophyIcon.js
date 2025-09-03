import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TrophyIcon = ({ size = 24, animated = false }) => (
  <MaterialCommunityIcons
    name="trophy-award"
    size={size}
    color="#FCD34D"
    style={{ opacity: 0.7 }}
  />
);

export default TrophyIcon;
