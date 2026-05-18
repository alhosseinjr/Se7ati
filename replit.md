# صحتي (Sohati) — Egyptian Medicine Verification Platform

A production-ready Arabic RTL web application that helps Egyptian citizens verify whether medicines are real or counterfeit, understand what they are taking, and report suspicious drugs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/sohati run dev` — run the frontend (port 24818)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required env: `AI_INTEGRATIONS_OPENROUTER_BASE_URL` + `AI_INTEGRATIONS_OPENROUTER_API_KEY` — auto-provisioned via Replit AI integrations

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, wouter routing, shadcn/ui, framer-motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenRouter via Replit AI Integrations (meta-llama/llama-3.3-70b-instruct)
- Barcode scanning: @zxing/library (BrowserMultiFormatReader)
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- OpenAPI spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/` (medicines, barcode_mappings, medicine_reports, scan_logs)
- API routes: `artifacts/api-server/src/routes/` (medicines, reports, assistant, stats)
- Frontend pages: `artifacts/sohati/src/pages/` (Home, Search, Report, Assistant)
- Generated hooks: `lib/api-client-react/src/generated/api.ts`
- Generated Zod schemas: `lib/api-zod/src/generated/api.ts`

## Architecture decisions

- Uses Replit's built-in PostgreSQL instead of Supabase (better integration, rollback support)
- Uses OpenRouter via Replit AI Integrations instead of raw Groq API (no user API keys needed)
- Medicine model: meta-llama/llama-3.3-70b-instruct (same family as specified Groq model)
- Barcode lookup checks barcode_mappings table first, then medicines.barcode directly
- RTL enforced at HTML level (dir="rtl" lang="ar") + Tailwind RTL variants
- Arabic fonts (Cairo, Noto Naskh Arabic) loaded from Google Fonts in index.html

## Product

- **Home**: Hero with verification CTA, live stats (medicine count, reports, users), how-it-works
- **Search (/search)**: Real-time medicine search, camera barcode scanner overlay, photo AI analysis
- **Report (/report)**: Suspicious medicine report form with all 27 Egyptian governorates
- **Assistant (/assistant)**: AI pharmacist chat in Egyptian Arabic dialect

## User preferences

- Egyptian market focus, fully Arabic RTL
- Legal disclaimer must appear on every page footer
- No emojis in UI — use icons only

## Gotchas

- After OpenAPI spec changes, always run codegen before touching routes or frontend
- Barcode scanner requires camera permissions on the device
- Image analysis uses text-only llama model (vision not available on OpenRouter for this model); fallback gracefully
- `pnpm --filter @workspace/db run push` to sync schema after schema file changes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Medicine seed data: 50 common Egyptian medicines pre-loaded in the DB
- EDA portal reference: http://eservices.edaegypt.gov.eg/EDASearch/SearchRegDrugs.aspx
