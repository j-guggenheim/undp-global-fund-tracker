import {cookies} from 'next/headers';
import {resolveLocale,type Locale} from './locales';
export async function setLanguageCookies(defaultLanguage:Locale,secure:boolean){const jar=await cookies();const options={path:'/',sameSite:'lax' as const,secure,maxAge:31536000};jar.set('pseah_default_language',defaultLanguage,options);jar.set('pseah_language',defaultLanguage,options)}
export async function clearDefaultLanguage(){(await cookies()).delete('pseah_default_language')}
export async function accountLanguage(sb:any,user:any):Promise<Locale>{const {data}=await sb.from('accounts').select('data').eq('user_id',user.id).maybeSingle();return resolveLocale(data?.data?.profile?.defaultLanguage,resolveLocale(user.user_metadata?.profile?.defaultLanguage))}
