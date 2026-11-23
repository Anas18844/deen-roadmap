import { createClient } from '@/lib/supabase/server';

export type LevelStatus = 'completed' | 'open' | 'locked';

export interface DashboardLevel {
  number: number;
  title: string;
  subtitle: string | null;
  status: LevelStatus;
  via: 'earned' | 'placement' | null;
  total: number | null;
  done: number | null;
  pct: number | null;
}

export interface Dashboard {
  current_level: number;
  total_points: number;
  streak: number;
  levels: DashboardLevel[];
  next: {
    item_id: string;
    title: string;
    url: string;
    kind: 'video' | 'book';
    level: number;
    track_id: string;
    section_title: string;
  } | null;
  pending_note: { section_id: string; title: string; level: number; track_id: string } | null;
  placement: { status: 'pending' | 'approved' | 'rejected'; requested_level: number; created_at: string } | null;
  weekly_points: { week: string; points: number }[];
}

export async function getDashboard(): Promise<Dashboard> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('my_dashboard');
  if (error) throw error;
  return data as Dashboard;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data as {
    id: string;
    role: 'student' | 'admin';
    email: string | null;
    full_name: string | null;
    governorate: string | null;
    age: number | null;
    previous_courses: string | null;
    entry_type: 'new' | 'returning' | null;
    onboarded_at: string | null;
  } | null;
}

export { LEVEL_WORDS, levelName } from './levels';
