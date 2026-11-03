import {useMemo} from 'react';
import {useDailyLogStore} from '../store/dailyLogStore';
import {useTemplateStore} from '../store/templateStore';
import {computeStreak} from '../utils/progress';
import {todayKey} from '../utils/date';

export const useStreak = () => {
  const logs = useDailyLogStore(s => s.logs);
  const templates = useTemplateStore(s => s.templates);
  return useMemo(
    () => computeStreak(logs, templates, todayKey()),
    [logs, templates],
  );
};
