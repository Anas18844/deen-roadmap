import 'server-only';
import { createClient } from '@/lib/supabase/server';

export interface StudentStat {
  user_id: string;
  full_name: string | null;
  email: string | null;
  governorate: string | null;
  entry_type: 'new' | 'returning' | null;
  current_level: number;
  level_pct: number;
  total_points: number;
  last_active_at: string | null;
  inactive_days: number | null;
  streak: number;
  has_pending_placement: boolean;
  completed_levels: number;
}

export interface LevelStat {
  level_number: number;
  title: string;
  students_count: number;
  avg_pct: number;
  completed_count: number;
}

export const INACTIVE_DAYS = 14;

export async function getStats() {
  const supabase = await createClient();
  const [students, levels, refreshed] = await Promise.all([
    supabase.rpc('admin_get_student_stats'),
    supabase.rpc('admin_get_level_stats'),
    supabase.rpc('admin_stats_refreshed_at'),
  ]);
  return {
    students: (students.data ?? []) as StudentStat[],
    levels: (levels.data ?? []) as LevelStat[],
    refreshedAt: refreshed.data as string | null,
  };
}

export const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' }) : '—';
