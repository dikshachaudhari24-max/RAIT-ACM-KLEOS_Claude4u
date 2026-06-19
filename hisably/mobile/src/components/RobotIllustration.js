import React from 'react';
import Svg, { Rect, Circle, Path, Line, G, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

/**
 * GST assistant robot — white line-art on a transparent background.
 * The robot holds an "INVOICE" clipboard and has a ₹ panel on its chest.
 * No fills, no container box — pure white strokes over the dark green hero.
 */
export const RobotIllustration = ({ size = 240, stroke = '#FFFFFF' }) => {
  const sw = 2.6;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <G stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Antennae */}
        <Line x1="92" y1="34" x2="86" y2="20" />
        <Circle cx="85" cy="17" r="3.2" />
        <Line x1="120" y1="34" x2="126" y2="20" />
        <Circle cx="127" cy="17" r="3.2" />

        {/* Head */}
        <Rect x="74" y="34" width="62" height="52" rx="16" />
        {/* Inner face screen */}
        <Rect x="82" y="44" width="46" height="33" rx="11" />
        {/* Eyes (filled white) */}
        <Circle cx="97" cy="58" r="3.4" fill={stroke} stroke="none" />
        <Circle cx="113" cy="58" r="3.4" fill={stroke} stroke="none" />
        {/* Smile */}
        <Path d="M96 67 Q105 74 114 67" />

        {/* Ears / headphones */}
        <Rect x="66" y="50" width="9" height="20" rx="4" />
        <Rect x="135" y="50" width="9" height="20" rx="4" />

        {/* Neck */}
        <Line x1="98" y1="86" x2="98" y2="94" />
        <Line x1="112" y1="86" x2="112" y2="94" />

        {/* Body */}
        <Path d="M76 100 Q76 94 86 94 L124 94 Q134 94 134 104 L134 150 Q134 166 116 166 L94 166 Q76 166 76 150 Z" />
        {/* Chest ₹ panel */}
        <Rect x="98" y="108" width="30" height="30" rx="7" />
        <SvgText x="113" y="130" fill={stroke} stroke="none" fontSize="20" fontWeight="bold" textAnchor="middle">₹</SvgText>

        {/* Right arm (robot's raised, bent arm) */}
        <Path d="M134 112 Q150 112 152 128 Q153 142 144 150" />
        <Circle cx="143" cy="153" r="5" />

        {/* Left arm holding clipboard */}
        <Path d="M76 116 Q62 118 60 132" />

        {/* Clipboard */}
        <Rect x="40" y="92" width="44" height="58" rx="6" />
        {/* Clip */}
        <Rect x="55" y="86" width="14" height="9" rx="3" />
        {/* INVOICE label */}
        <SvgText x="62" y="110" fill={stroke} stroke="none" fontSize="9" fontWeight="bold" textAnchor="middle">INVOICE</SvgText>
        {/* Invoice rows */}
        <Line x1="47" y1="119" x2="77" y2="119" />
        <Line x1="47" y1="126" x2="77" y2="126" />
        <Line x1="47" y1="133" x2="68" y2="133" />
        <Line x1="58" y1="142" x2="77" y2="142" strokeWidth={sw + 1.4} />
      </G>
    </Svg>
  );
};
