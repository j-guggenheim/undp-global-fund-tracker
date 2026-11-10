import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export function isConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)}
export async function supabaseServer(){
 const jar=await cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll(){return jar.getAll()},setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Server Components cannot refresh cookies; proxy handles refresh. */}}}});
}
export async function currentUser(){if(!isConfigured())return null;const sb=await supabaseServer();const {data:{user},error}=await sb.auth.getUser();return error?null:user}
