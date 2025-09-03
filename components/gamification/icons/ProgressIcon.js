import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../theme';

const ProgressIcon = ({ size = 24, animated = false }) => (
  <MaterialCommunityIcons
    name="layers"
    size={size}
    color={Colors.accent}
    style={{ opacity: 0.7 }}
  />
);

export default ProgressIcon;
