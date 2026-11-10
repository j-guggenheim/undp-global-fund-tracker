import {supabaseServer,isConfigured} from '../../../lib/supabase/server';
import {sameOrigin,validateProfile,requestOrigin} from '../../../lib/validation';
import {accountLanguage,setLanguageCookies,clearDefaultLanguage} from '../../../lib/i18n/preferences';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Invalid request origin.'},{status:403});
 if(!isConfigured())return Response.json({error:'Account services are not configured yet.'},{status:503});
 if(!req.headers.get('content-type')?.includes('application/json'))return Response.json({error:'JSON required.'},{status:415});
 try{
 const b=await req.json();const sb=await supabaseServer();const origin=requestOrigin(req);
 if(b.action==='logout'){const {error}=await sb.auth.signOut({scope:'local'});if(!error)await clearDefaultLanguage();return error?Response.json({error:'Could not sign out. Please try again.'},{status:500}):Response.json({ok:true})}
 if(b.action==='update-password'){
  const {data:{user}}=await sb.auth.getUser();if(!user)return Response.json({error:'Please open a valid password reset link.'},{status:401});
  if(typeof b.password!=='string'||b.password.length<12||b.password.length>128)throw Error('Use a password between 12 and 128 characters.');
  const {error}=await sb.auth.updateUser({password:b.password});if(error)return Response.json({error:'Could not update your password. Please request a new reset link.'},{status:400});await sb.auth.signOut({scope:'global'});return Response.json({ok:true});
 }
 if(typeof b.email!=='string'||!/^\S+@\S+\.\S+$/.test(b.email)||b.email.length>254)throw Error('Enter a valid email address.');const email=b.email.trim().toLowerCase();
 if(b.action==='reset'){if(process.env.NEXT_PUBLIC_EMAIL_DELIVERY_ENABLED!=='true')return Response.json({error:'Email password recovery is not available yet.'},{status:503});await sb.auth.resetPasswordForEmail(email,{redirectTo:`${origin}/auth/callback?next=/reset-password`});return Response.json({message:'If an account exists for this email, a password reset link will arrive shortly.'})}
 if(typeof b.password!=='string'||b.password.length>128)throw Error('Enter your password.');
 if(b.action==='login'){const {data,error}=await sb.auth.signInWithPassword({email,password:b.password});if(error)return Response.json({error:'Unable to sign in. Check your email and password.'},{status:400});const defaultLanguage=await accountLanguage(sb,data.user);await setLanguageCookies(defaultLanguage,origin.startsWith('https:'));return Response.json({ok:true,defaultLanguage})}
 if(b.action==='signup'){
  if(b.password.length<12)throw Error('Use at least 12 characters for your password.');const profile=validateProfile({...b.profile,contact:email});
  const {data,error}=await sb.auth.signUp({email,password:b.password,options:{data:{profile},emailRedirectTo:`${origin}/auth/callback`}});
  if(error)return Response.json({error:'Unable to create your account. Please try again or sign in if you already registered.'},{status:400});
  if(data.session)await setLanguageCookies(profile.defaultLanguage,origin.startsWith('https:'));
  return Response.json({ok:true,defaultLanguage:profile.defaultLanguage,requiresConfirmation:!data.session,message:'Check your email to confirm your account, then sign in. If you already have an account, you can sign in or reset your password.'});
 }
 return Response.json({error:'Invalid action.'},{status:400});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Please check your details and try again.'},{status:400})}
}
