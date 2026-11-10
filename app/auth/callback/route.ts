import {NextResponse} from 'next/server';
import {supabaseServer} from '../../../lib/supabase/server';
export async function GET(req:Request){const url=new URL(req.url),code=url.searchParams.get('code');if(code){const sb=await supabaseServer();const {error}=await sb.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(url.searchParams.get('next')==='/reset-password'?'/reset-password':'/',url.origin))}return NextResponse.redirect(new URL('/login?error=invalid-link',url.origin))}
