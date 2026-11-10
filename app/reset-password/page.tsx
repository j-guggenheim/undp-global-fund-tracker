import AuthForm from '../auth-form';
import {currentUser} from '../../lib/supabase/server';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function ResetPassword(){if(!await currentUser())redirect('/forgot-password');return <AuthForm mode="update-password"/>}
