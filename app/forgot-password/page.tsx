import AuthForm from '../auth-form';
import {isConfigured} from '../../lib/supabase/server';
export const dynamic='force-dynamic';
export default function ForgotPassword(){return <AuthForm mode="reset" configured={isConfigured()}/>}
