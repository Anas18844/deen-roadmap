import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BOOKS_BUCKET, createAdminClient } from '@/lib/supabase/admin';

// Opens an uploaded book. The item query runs under the student's RLS, so a book in a locked
// level returns nothing; only then do we mint a 10-minute signed link to the private file.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from('items').select('storage_path, url').eq('id', id).maybeSingle();
  if (!item) return new NextResponse('هذا الكتاب غير متاح لك.', { status: 404 });
  if (!item.storage_path) return NextResponse.redirect(item.url);

  const { data, error } = await createAdminClient().storage.from(BOOKS_BUCKET).createSignedUrl(item.storage_path, 600);
  if (error || !data) return new NextResponse('تعذّر فتح الكتاب، حاول مرة أخرى.', { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
