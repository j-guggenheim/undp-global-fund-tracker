import AuthForm from '../auth-form';
import {currentUser,isConfigured} from '../../lib/supabase/server';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){if(await currentUser())redirect('/');const q=await searchParams;return <AuthForm mode="login" configured={isConfigured()} initialError={q.error?'Your sign-in link is invalid or expired. Please try again.':''}/>}
