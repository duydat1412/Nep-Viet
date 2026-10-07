import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { allowed } = checkRateLimit(`share_${ip}`, 5, 60000);
  
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    // Validate body with Zod in a real implementation
    
    const slug = nanoid(10);
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .from('lookbook_shares')
      .insert([
        { slug, data: body }
      ]);
      
    if (error) throw error;
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.json({ slug, url: `${siteUrl}/share/${slug}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('lookbook_shares')
      .select('data')
      .eq('slug', slug)
      .single();
      
    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(data.data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
