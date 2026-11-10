import type { Metadata } from "next";
import "./globals.css";
import {cookies} from "next/headers";
import {LanguageProvider} from "../lib/i18n/context";
import {isLocale,resolveLocale,directionFor} from "../lib/i18n/locales";
export const metadata: Metadata = {title:"PSEAH Compliance Tracker | Global Fund Partnership",description:"Your organization’s eight-standard PSEAH self-assessment, guidance and evidence in one place."};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const jar=await cookies();const locale=resolveLocale(jar.get('pseah_language')?.value);const savedDefault=jar.get('pseah_default_language')?.value;const defaultLanguage=isLocale(savedDefault)?savedDefault:null;const layoutDirection=directionFor(defaultLanguage??locale);return <html lang={locale} dir={layoutDirection} data-layout-dir={layoutDirection} data-text-dir={directionFor(locale)}><body><LanguageProvider initialLocale={locale} initialDefaultLanguage={defaultLanguage}>{children}</LanguageProvider></body></html>}
