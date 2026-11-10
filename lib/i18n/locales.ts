export const languageNames={en:'English',ar:'العربية',zh:'中文',fr:'Français',ru:'Русский',es:'Español'};
export type Locale=keyof typeof languageNames;
export const supportedLocales=Object.keys(languageNames) as Locale[];
export function isLocale(value:unknown):value is Locale{return typeof value==='string'&&supportedLocales.includes(value as Locale)}
export function resolveLocale(value:unknown,fallback:Locale='en'):Locale{return isLocale(value)?value:fallback}
export function directionFor(locale:Locale){return locale==='ar'?'rtl':'ltr'}
