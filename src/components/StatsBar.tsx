import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {StreakInfo} from '../models/types';
import {colors} from '../theme/colors';

const Stat = ({label, value}: {label: string; value: string | number}) => (
  <View style={styles.stat}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const StatsBar: React.FC<{info: StreakInfo}> = ({info}) => (
  <View style={styles.row}>
    <Stat label="Streak" value={info.currentStreak} />
    <Stat label="Best" value={info.bestStreak} />
    <Stat label="Vitality" value={info.vitalityScore} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: {alignItems: 'center'},
  value: {fontSize: 22, fontWeight: '700', color: colors.primary},
  label: {fontSize: 12, color: colors.muted},
});

export default StatsBar;
