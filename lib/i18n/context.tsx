'use client';
import React,{createContext,useContext,useEffect,useState} from 'react';
import {Languages} from 'lucide-react';
import messages from './messages.json';
import {languageNames,directionFor,type Locale} from './locales';
export {languageNames,type Locale} from './locales';
const dictionary=messages as Record<string,Record<string,string>>;
export function translateText(text:string,locale:Locale,variables:Record<string,string|number>={}):string{
 const core=text.trim();if(!core)return text;let translated=locale==='en'?core:(dictionary[core]?.[locale]??core);
 if(translated===core&&!core.includes('{')){
  let match;if((match=core.match(/^(\d+)\/8 compliant$/)))return translateText('{count}/8 compliant',locale,{count:match[1]});
  if((match=core.match(/^(\d+) of 8 standards compliant$/)))return translateText('{count} of 8 standards compliant',locale,{count:match[1]});
  if(core.startsWith('Status: '))return translateText('Status: {name}',locale,{name:translateText(core.slice(8),locale)});
  if(core.startsWith('Remove '))return translateText('Remove {name}',locale,{name:core.slice(7)});
 }
 for(const [key,value] of Object.entries(variables))translated=translated.replaceAll(`{${key}}`,String(value));
 return text.slice(0,text.length-text.trimStart().length)+translated+text.slice(text.trimEnd().length);
}
type LanguageState={locale:Locale;defaultLanguage:Locale|null;setLocale:(l:Locale)=>void;setDefaultLanguage:(l:Locale,switchText?:boolean)=>void};
const LanguageContext=createContext<LanguageState>({locale:'en',defaultLanguage:null,setLocale:()=>{},setDefaultLanguage:()=>{}});
export function LanguageProvider({initialLocale,initialDefaultLanguage=null,children}:{initialLocale:Locale;initialDefaultLanguage?:Locale|null;children:React.ReactNode}){
 const [locale,setLocale]=useState<Locale>(initialLocale);
 const [defaultLanguage,saveDefaultLanguage]=useState<Locale|null>(initialDefaultLanguage);
 const setDefaultLanguage=(language:Locale,switchText=false)=>{saveDefaultLanguage(language);if(switchText)setLocale(language)};
 useEffect(()=>{const root=document.documentElement;root.lang=locale;root.dir=directionFor(defaultLanguage??locale);root.dataset.layoutDir=directionFor(defaultLanguage??locale);root.dataset.textDir=directionFor(locale);document.cookie=`pseah_language=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;if(defaultLanguage)document.cookie=`pseah_default_language=${defaultLanguage}; Path=/; Max-Age=31536000; SameSite=Lax`;document.title=translateText('PSEAH Compliance Tracker',locale)},[locale,defaultLanguage]);
 return <LanguageContext.Provider value={{locale,defaultLanguage,setLocale,setDefaultLanguage}}>{children}</LanguageContext.Provider>
}
export function useLanguage(){const {locale,setLocale,defaultLanguage,setDefaultLanguage}=useContext(LanguageContext);const t=(text:string,vars?:Record<string,string|number>)=>translateText(text,locale,vars);
 function localize(node:React.ReactNode):React.ReactNode{
  if(typeof node==='string')return node.trim()?<bdi dir={directionFor(locale)} className="localized-text">{t(node)}</bdi>:node;
  if(Array.isArray(node))return node.map((child,index)=>{const result=localize(child);return React.isValidElement(result)&&result.key===null?React.cloneElement(result,{key:index}):result});
  if(!React.isValidElement(node))return node;
  const props=node.props as Record<string,any>;
  // Account fields and filenames are data, never interface translations.
  if(props.translate==='no')return React.cloneElement(node,{dir:props.dir??'auto'} as any);
  const changed:Record<string,any>={};for(const key of ['placeholder','aria-label','title','alt'])if(typeof props[key]==='string')changed[key]=t(props[key]);
  if(props.children!==undefined)changed.children=node.type==='option'||node.type==='textarea'?typeof props.children==='string'?t(props.children):props.children:localize(props.children);
  return React.cloneElement(node,changed);
 }
 return {locale,setLocale,defaultLanguage,setDefaultLanguage,layoutDirection:directionFor(defaultLanguage??locale),textDirection:directionFor(locale),t,localize};
}
export function LanguagePicker(){const {locale,setLocale,t}=useLanguage();return <label className="language-picker"><Languages size={16}/><select aria-label={t('Language')} value={locale} onChange={e=>setLocale(e.target.value as Locale)}>{Object.entries(languageNames).map(([code,name])=><option key={code} value={code} lang={code}>{name}</option>)}</select></label>}
