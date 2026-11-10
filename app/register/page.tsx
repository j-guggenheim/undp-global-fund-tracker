import AuthForm from '../auth-form';
import {currentUser,isConfigured} from '../../lib/supabase/server';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Register(){if(await currentUser())redirect('/');return <AuthForm mode="signup" configured={isConfigured()}/>}
