import {standards} from './standards';
import {isLocale,type Locale} from './i18n/locales';
export type Profile={organization:string;country:string;name:string;contact:string;grant:string;defaultLanguage:Locale};
export function validateProfile(input:unknown,fallbackLanguage:Locale='en'):Profile{
 if(!input||typeof input!=='object')throw Error('Organization details are required.');
 const raw=input as Record<string,unknown>,p={} as Profile;
 if(raw.defaultLanguage!==undefined&&!isLocale(raw.defaultLanguage))throw Error('Select a supported language.');p.defaultLanguage=isLocale(raw.defaultLanguage)?raw.defaultLanguage:fallbackLanguage;
 for(const key of ['organization','country','name','contact','grant'] as const){if(typeof raw[key]!=='string'||raw[key].length>500)throw Error('Check your organization details.');p[key]=raw[key].trim()}
 if(!p.organization||!p.country||!p.name||!/^\S+@\S+\.\S+$/.test(p.contact))throw Error('Check your organization details.');return p;
}
export function validateProgress(input:unknown){if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid progress.');const raw=input as Record<string,unknown>,result:Record<string,string>={};for(const s of standards)for(let i=0;i<s.methods.length;i++){const k=`${s.id}-${i}`,v=raw[k]??'Not Started';if(typeof v!=='string'||!['Not Started','In Progress','Completed'].includes(v))throw Error('Invalid status.');result[k]=v}return result}
export function requestOrigin(req:Request){const host=req.headers.get('host')||new URL(req.url).host;const scheme=req.headers.get('x-forwarded-proto')==='https'?'https':new URL(req.url).protocol.replace(':','');return `${scheme}://${host}`}
export function sameOrigin(req:Request){try{const origin=req.headers.get('origin');return origin!==null&&new URL(origin).origin===requestOrigin(req)}catch{return false}}
