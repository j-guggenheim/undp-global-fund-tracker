import {redirect} from 'next/navigation';
import Tracker from './tracker';
import {currentUser,isConfigured} from '../lib/supabase/server';
export const dynamic='force-dynamic';
export default async function Home(){if(!isConfigured())redirect('/login');const user=await currentUser();if(!user)redirect('/login');return <Tracker email={user.email||''} displayName={user.user_metadata?.profile?.name||user.email||'Your account'}/>}
