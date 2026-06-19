import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Polyline, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography } from '../theme';

// Donut / ring chart with a centered label.
export const DonutChart = ({ segments = [], size = 150, strokeWidth = 18, centerLabel, centerSub }) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.divider} strokeWidth={strokeWidth} fill="none" />
          {segments.map((seg, i) => {
            const len = ((seg.value || 0) / total) * c;
            const node = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return node;
          })}
        </G>
      </Svg>
      <View style={styles.donutCenter}>
        {centerLabel != null && <Text style={[typography.display, { color: colors.textPrimary }]}>{centerLabel}</Text>}
        {centerSub != null && <Text style={[typography.caption, { color: colors.textSecondary }]}>{centerSub}</Text>}
      </View>
    </View>
  );
};

// Smooth-ish trend line with a soft gradient area fill.
export const TrendLine = ({ data = [], width = 300, height = 120, color = colors.primary }) => {
  const series = data.length ? data : [0, 0];
  const pad = 10;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (series.length - 1 || 1);

  const pts = series.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `${line} ${pad + (series.length - 1) * stepX},${height - pad} ${pad},${height - pad}`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.18} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Polygon points={area} fill="url(#trendFill)" />
      <Polyline points={line} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
};

// Vertical bar chart (simple Views, navy bars).
export const MiniBars = ({ data = [], color = colors.primary, height = 120 }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={[styles.barsRow, { height: height + 24 }]}>
      {data.map((d, i) => (
        <View key={i} style={styles.barCol}>
          <View style={styles.barTrack}>
            <View style={{ width: 26, height: Math.max(6, (d.value / max) * height), backgroundColor: color, borderRadius: 6 }} />
          </View>
          <Text style={[typography.caption, styles.barLabel]} numberOfLines={1}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  donutCenter: { position: 'absolute', alignItems: 'center' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { justifyContent: 'flex-end', alignItems: 'center' },
  barLabel: { color: colors.textSecondary, marginTop: 6, maxWidth: 60, textAlign: 'center' },
});
