import type { Metadata } from "next";
import "./globals.css";
import {cookies} from "next/headers";
import {LanguageProvider} from "../lib/i18n/context";
import {languageNames,type Locale} from "../lib/i18n/locales";
export const metadata: Metadata = {title:"PSEAH Compliance Tracker | Global Fund Partnership",description:"Your organization’s eight-standard PSEAH self-assessment, guidance and evidence in one place."};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const selected=(await cookies()).get("pseah_language")?.value||"en";const locale=(selected in languageNames?selected:"en") as Locale;return <html lang={locale} dir={locale==="ar"?"rtl":"ltr"}><body><LanguageProvider initialLocale={locale}>{children}</LanguageProvider></body></html>}
