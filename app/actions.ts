'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { toArabicError } from '@/lib/supabase/errors';

export type ProgressResult =
  | { ok: true; level_completed: boolean; level_number: number }
  | { ok: false; error: string };

export async function completeItem(itemId: string): Promise<ProgressResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('complete_item', { p_item_id: itemId });
  if (error) return { ok: false, error: toArabicError(error) };
  revalidatePath('/', 'layout');
  return { ok: true, ...(data as { level_completed: boolean; level_number: number }) };
}

export async function uncompleteItem(itemId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('uncomplete_item', { p_item_id: itemId });
  if (error) return { ok: false, error: toArabicError(error) };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function saveNote(sectionId: string, body: string): Promise<ProgressResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('save_section_note', { p_section_id: sectionId, p_body: body });
  if (error) return { ok: false, error: toArabicError(error) };
  revalidatePath('/', 'layout');
  return { ok: true, ...(data as { level_completed: boolean; level_number: number }) };
}

export async function completeOnboarding(
  _prev: { error?: string } | undefined,
  form: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const entryType = String(form.get('entry_type') ?? '');
  const age = Number(form.get('age'));
  const { error } = await supabase.rpc('complete_onboarding', {
    p_full_name: String(form.get('full_name') ?? ''),
    p_governorate: String(form.get('governorate') ?? ''),
    p_age: Number.isFinite(age) && age > 0 ? age : null,
    p_previous_courses: String(form.get('previous_courses') ?? ''),
    p_entry_type: entryType,
    p_requested_level: entryType === 'returning' ? Number(form.get('requested_level')) : null,
  });
  if (error) return { error: toArabicError(error) };
  redirect('/');
}

export async function requestPlacement(level: number): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('request_placement', { p_level: level });
  if (error) return { ok: false, error: toArabicError(error) };
  revalidatePath('/');
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
