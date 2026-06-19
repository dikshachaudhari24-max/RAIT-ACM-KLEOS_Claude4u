import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../theme';

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Standard monthly GST filing due dates (compliance constants, not user data).
const FILINGS = {
  11: { type: 'GSTR-1', color: colors.warning },
  14: { type: 'GSTR-2B', color: colors.success },
  20: { type: 'GSTR-3B', color: colors.danger },
};

export const ComplianceCalendar = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
  };

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <View>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={prev} hitSlop={hit}><Ionicons name="chevron-back" size={20} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={[typography.section, { color: colors.textPrimary }]}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={next} hitSlop={hit}><Ionicons name="chevron-forward" size={20} color={colors.textPrimary} /></TouchableOpacity>
      </View>

      <View style={styles.row}>
        {DOW.map((d) => (
          <Text key={d} style={[typography.monoCaption, styles.dow]}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((d, i) => {
          const filing = d ? FILINGS[d] : null;
          const todayCell = d && isToday(d);
          return (
            <View key={i} style={styles.cell}>
              {d ? (
                <View style={[styles.dayWrap, filing && { backgroundColor: filing.color }, todayCell && !filing && styles.todayWrap]}>
                  <Text style={[typography.caption, { color: filing || todayCell ? '#fff' : colors.textPrimary }]}>{d}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        {Object.values(FILINGS).map((f) => (
          <View key={f.type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: f.color }]} />
            <Text style={[typography.monoCaption, { color: colors.textSecondary }]}>{f.type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const hit = { top: 8, bottom: 8, left: 8, right: 8 };

const styles = StyleSheet.create({
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  row: { flexDirection: 'row' },
  dow: { flex: 1, textAlign: 'center', color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  cell: { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  dayWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  todayWrap: { backgroundColor: colors.primaryDeep },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.divider },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
});
