import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, EmptyState, StatusChip } from '../components';
import { api } from '../services/api';
import { useT } from '../i18n';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const statusMeta = {
  pending: { border: colors.danger, tone: 'danger', key: 'status.open' },
  in_progress: { border: colors.warning, tone: 'warning', key: 'status.inProgress' },
  completed: { border: colors.success, tone: 'success', key: 'status.done' },
};
const filterStatus = [null, 'pending', 'in_progress', 'completed'];

export const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const t = useT();

  const filterLabels = [t('tasks.allTasks'), t('status.open'), t('status.inProgress'), t('status.done')];

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data.tasks || []);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const handleDone = async (taskId) => {
    try {
      await api.markTaskDone(taskId, 'manual', 'Marked done');
      await loadTasks();
    } catch (e) {
      Alert.alert(t('common.error'), t('voice.error'));
    }
  };

  const pending = tasks.filter((x) => x.status !== 'completed').length;
  const done = tasks.filter((x) => x.status === 'completed').length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const filtered = activeFilter === 0 ? tasks : tasks.filter((x) => x.status === filterStatus[activeFilter]);

  return (
    <Screen title={t('tasks.title')} subtitle={t('tasks.tagline')} heroHeight={158} leftIcon="notifications-outline" avatar="RK" onAvatarPress={() => navigation.navigate('Profile')}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {filterLabels.map((label, i) => (
              <TouchableOpacity key={i} style={[styles.filterChip, activeFilter === i && styles.filterChipActive]} onPress={() => setActiveFilter(i)}>
                <Text style={[typography.caption, { color: activeFilter === i ? '#fff' : colors.textPrimary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filtered.length === 0 ? (
            <EmptyState icon="checkmark-done-outline" title={t('tasks.noTasks')} />
          ) : (
            filtered.map((task, i) => {
              const meta = statusMeta[task.status] || statusMeta.pending;
              return (
                <View key={i} style={[styles.taskCard, { borderLeftColor: meta.border }]}>
                  <View style={styles.taskHeader}>
                    <Text style={[typography.labelBold, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                      {(task.task_type || '').replace(/_/g, ' ')}
                    </Text>
                    <StatusChip label={t(meta.key)} tone={meta.tone} />
                  </View>
                  {task.supplier_name && (
                    <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>{task.supplier_name}</Text>
                  )}
                  {task.amount ? (
                    <Text style={[typography.body, { color: colors.warning, marginTop: 4 }]}>
                      {t('tasks.itcAffected', { amount: formatINR(task.amount) })}
                    </Text>
                  ) : null}
                  {task.status !== 'completed' && (
                    <TouchableOpacity style={styles.doneBtn} onPress={() => handleDone(task.id)}>
                      <Text style={[typography.caption, { color: '#fff' }]}>{t('tasks.markDone')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}

          {tasks.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={[typography.section, { color: colors.textPrimary }]}>{t('tasks.summary')}</Text>
              <View style={styles.completionRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>{t('tasks.completionRate')}</Text>
                <Text style={[typography.labelBold, { color: colors.primary }]}>{completion}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${completion}%` }]} />
              </View>
              {pending > 0 && (
                <View style={styles.highRow}>
                  <View style={styles.highDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.labelBold, { color: colors.textPrimary }]}>{t('tasks.highPriorityCount', { n: pending })}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('tasks.highPriorityNote')}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, height: 36, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.outlineVariant },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  taskCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginBottom: 12, borderLeftWidth: 4, ...shadow.card },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doneBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: colors.primary, paddingHorizontal: 16, height: 32, borderRadius: radius.smallBtn, justifyContent: 'center' },
  summaryCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginTop: spacing.cardGap, ...shadow.card },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 8 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.divider, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  highRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 },
  highDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning, marginTop: 6, marginRight: 12 },
});
