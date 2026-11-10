# PSEAH Partner Compliance — independent deployment

This application runs on standard Next.js hosting and uses Supabase for email/password authentication, PostgreSQL records and private evidence storage. It has no ChatGPT sign-in or Sites runtime dependency.

## Deployment

1. Create a dedicated Supabase project. Apply `supabase/migrations/202611100001_initial.sql`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the hosting environment. Both are public project configuration; never expose a service-role key.
3. Configure the production site URL in Supabase Auth. Allow `/auth/callback` on the production origin as a redirect URL.
4. The initial launch uses immediate email/password registration, with email confirmation disabled by the owner’s choice. Email recovery is hidden until `NEXT_PUBLIC_EMAIL_DELIVERY_ENABLED=true` and a production SMTP sender is configured. Supabase’s default email service restricts recipients. Configure SMTP before enabling email confirmation or recovery.
5. Deploy with `npm run build` on Vercel (Next.js preset). Publish the production deployment.
6. Verify new-account creation, email confirmation, login, logout, password reset, progress persistence, evidence upload/download and isolation between two accounts.

For email links that work across devices, set these Supabase templates:

- Confirm signup URL: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
- Reset password URL: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`

Registration captures organization, country, contact name, email, an optional grant reference, and a password of at least 12 characters. An auth trigger creates the organization record atomically. Each database table has row-level security, and private storage policies restrict objects to the account-ID folder.

Evidence uploads go directly to private storage to preserve the 10 MB per-file limit without routing file bytes through Vercel's request-size limit. The server verifies stored file metadata before recording the attachment.

## Existing Sites data

The original Sites database and files are not automatically shared with this deployment. Keep the original site available until records and attachments have been exported, mapped to verified new account owners, imported, and checked. Do not infer ownership from editable organization contact fields. No existing Sites data is overwritten by this application.

## Development

Copy `.env.example` to `.env.local`, fill in the public project URL and publishable key, and run `npm install` followed by `npm run dev`. `npm run typecheck` and `npm run build` check the deployable source.

## Languages

The language selector covers English, Arabic, Chinese, French, Russian and Spanish. Interface translations are maintained in `lib/i18n/ui.tsv` and `lib/i18n/standards.tsv`; run `node scripts/build-translations.mjs` after editing. Arabic uses right-to-left layout. User-entered organization data, resource filenames and file bytes are excluded from translation. `npm run check` verifies translation coverage and unchanged document hashes.

Default language is saved with each account profile and restored on every password sign-in. The registration choice initially follows the registration page language, and Account lets users change it later. The saved default determines screen layout direction; the temporary language picker determines reading direction independently. Older profiles without this field use English until a preference is saved.
