# Diksilab

Digital agency website for Diksilab, built with Next.js App Router and deployed on Vercel.

## Live site

- Production: https://diksi-lab.vercel.app
- GitHub repository: https://github.com/muhammadfadli-dot/diksi-lab

## Stack

- Next.js 16 / React 19
- TypeScript
- App Router
- Vercel

## Main pages

- Home, Vision, Services, and Works
- Consultation / Work Together
- Interactive Audit and Channel Audit
- Articles, individual article posts, and FAQ

## Local development

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Validation and deployment

```bash
npm run build
npx vercel --prod
```

The project is linked to Vercel. Use a production deploy only after validating the build and intended changes.

## Change log

### 2026-08-02 — Diksilab identity and Services refinement

- Replaced the text-based header and footer wordmark with the official Diksilab logo asset.
- Added the Diksilab icon as the site favicon through `app/icon.png`.
- Refined the Services page into four strategic agency offerings: UI/UX & Web, Digital Marketing, SEO, and Brand & Rebranding.
- Added detailed scope, package fit, and deliverables for Basic, Intermediate, and Advanced tiers.
- Published the verified production build to Vercel.

### Previous delivery highlights

- Migrated the runtime from Vinext/Cloudflare to Next.js/Vercel.
- Added articles, FAQ, Work Together, Interactive Audit, and Channel Audit flows.
- Refined the portfolio Works layout and CTA treatment.
