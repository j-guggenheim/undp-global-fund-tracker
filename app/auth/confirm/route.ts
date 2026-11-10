import {NextResponse} from 'next/server';
import {supabaseServer} from '../../../lib/supabase/server';
export async function GET(req:Request){const url=new URL(req.url),token_hash=url.searchParams.get('token_hash'),type=url.searchParams.get('type');if(token_hash&&(type==='email'||type==='signup'||type==='recovery')){const sb=await supabaseServer();const {error}=await sb.auth.verifyOtp({token_hash,type});if(!error)return NextResponse.redirect(new URL(type==='recovery'?'/reset-password':'/',url.origin))}return NextResponse.redirect(new URL('/login?error=invalid-link',url.origin))}
