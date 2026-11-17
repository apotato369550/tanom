# TANOM · Farm weather guidance

TANOM is a Philippine farm-weather dashboard built with Next.js App Router, TypeScript, React, Tailwind CSS, Recharts, and Leaflet. The repository and package retain the `rainwatch-ph` name.

Weather, climate, and crop-context views work without accounts, API keys, or a database. Optional on-demand AI analysis requires server configuration and Supabase. The public ML page is a placeholder, not a deployed prediction service.

## Run locally

Use Node.js 20.9+ (Node 24 recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000. The server needs internet access to Open-Meteo. Provider failures produce errors or unavailable states rather than sample weather.

### Verification

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

For browser checks:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Playwright starts a separate production server on port 3100. Tests include deterministic weather fixtures, responsive layouts, accessibility checks, and retained live-provider scenarios. Only live scenarios require Open-Meteo availability; test fixtures are not production fallback data. Screenshots and other artifacts go to `test-results/`.

`npm start` serves a completed production build. `npm run format` rewrites formatting across the repository; `format:check` only checks it.

## Current application

| Page           | Purpose                                           |
| -------------- | ------------------------------------------------- |
| `/`            | Current farm-weather overview                     |
| `/conditions`  | Hourly and daily conditions                       |
| `/planning`    | Six-month outlook and annual climate context      |
| `/environment` | Environmental conditions and crop/climate matches |
| `/ml`          | Coming-soon page; no ML predictions are available |

`/growing` redirects to `/environment`. The shared dashboard supports English and Cebuano, nationwide Philippine location selection through a map/list, and optional browser geolocation. Bundled municipality and province-area geometry determines supported Philippine land selections; the interface is no longer restricted to ten cities.

### Data flow and limitations

The browser requests coordinate-based Next.js routes; the server validates the location, fetches Open-Meteo data, and returns structured results:

| Endpoint                               | Data                                                      | Provider cache                 |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------ |
| `GET /api/environment?lat=…&lon=…`     | Current conditions, hourly series, and seven-day forecast | 10 minutes                     |
| `GET /api/climate-profile?lat=…&lon=…` | ERA5 climate normals for 1991–2020                        | 24 hours                       |
| `GET /api/outlook?lat=…&lon=…`         | 183-day ECMWF SEAS5 ensemble-mean outlook                 | 24 hours                       |
| `POST /api/analysis`                   | Optional on-demand AI report                              | Shared report cache; see below |

Coordinate data routes reject unsupported/non-Philippine-land selections with 400 and report upstream failures with 502. Climate normals describe historical modeled climate, not today's observations. Seasonal ensemble means provide broad planning context, not precise daily forecasts. Weather and historical estimates are model/grid data, not local rain-gauge measurements.

Crop cards use EcoCrop tolerances. Explicitly marked closest alternatives can exceed those tolerances and are not suitable-crop endorsements. Missing inputs remain unavailable rather than becoming fabricated measurements. Follow PAGASA and local authorities for official warnings; TANOM does not predict flooding.

## Deployment and optional AI

### Weather-only deployment

Deploy as a Next.js server application, for example on Vercel: use the repository root, `npm install`, `npm run build`, and Node.js 24.x. No environment variables or separate database are required for weather-only use. Do not use static export: the API routes require a server runtime. Building does not require live weather-provider availability.

### Enable public analysis

Reports are generated on request for current conditions, conditions detail, seasonal planning, and environment context. The server reconstructs weather context rather than trusting client-supplied weather values. Selected location and modeled weather/climate/crop context are sent to OpenRouter.

1. Create/link a Supabase project and apply repository migrations with the Supabase CLI:

   ```bash
   cp .env.example .env.local
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

   Public analysis requires `supabase/migrations/202611120001_public_analysis.sql` and a reachable database for shared reports, quotas, and job admission.

2. Configure the server using [.env.example](.env.example):

   | Variable                      | Requirement                                                                    |
   | ----------------------------- | ------------------------------------------------------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`    | Supabase project URL                                                           |
   | `SUPABASE_SERVICE_ROLE_KEY`   | Server-only database access; never expose it to browser code                   |
   | `OPENROUTER_API_KEY`          | Server-only OpenRouter credential                                              |
   | `OPENROUTER_MODEL`            | `openrouter/free` or a pinned `vendor/model:free` model only                   |
   | `ANALYSIS_IP_HASH_SECRET`     | Random server-only secret of at least 32 characters, stable across replicas    |
   | `ANALYSIS_IP_STRATEGY`        | Explicitly choose `single-header` or `xff`; no implicit local/public fallback  |
   | `ANALYSIS_IP_HEADER`          | For `single-header`: lowercase header your trusted edge overwrites             |
   | `ANALYSIS_TRUSTED_PROXY_HOPS` | For `xff`: explicit count of trusted appending proxies, counted from the right |

   Deploy behind a proxy you control and block direct origin access. Do not assume a forwarded header is trustworthy merely because it exists. `.env.example` also includes the anon key used by optional legacy integration.

3. Optional controls: `OPENROUTER_MAX_TOKENS` defaults to 4096 (integer range 2048–16384), covering reasoning plus visible output. `OPENROUTER_REASONING_EFFORT` must be supported by the chosen model; blank preserves provider defaults. `ANALYSIS_MODEL_VERSION` defaults to `1`; change it when a model alias changes behavior to invalidate report identity.

Only free-model routing is accepted, with no paid fallback or automatic retry. Truncated responses are rejected rather than displayed as completed guidance. Sanitized diagnostics do not log credentials, prompt contents, or reasoning text.

Durable limits use UTC days: 40 attempts/site/day and 5/IP/day; minute limits are 120/site and 10/IP. At most two site jobs and one job/IP run concurrently. Failed attempts consume quota. Shared report lifetimes are six hours for current/conditions, seven days for six-month outlook, and 30 days for annual/environment reports. Keep the IP secret consistent across replicas; rotating it resets per-IP counters.

## ML experiment and retained legacy functionality

The standalone [Cebu Ridge experiment](ml/README.md) requires Python 3.11+, not Supabase or application credentials. It compares next-day forecast rainfall with an ERA5 modeled reference using a held-out time split. Follow that README for download, training, evaluation, and tests. It has no automatic promotion or application-ready export; the dashboard's `/ml` page remains “Coming soon.”

The repository retains the original ten-city `/api/weather?location=cebu` route, rainfall aggregation/stress calculations, optional Supabase snapshot/inference plumbing, ingestion Edge Function, and `/history` verification page. These are not the main TANOM coordinate-based interface. Legacy correction failures preserve raw-forecast fallback. Historical-weather verification is a modeled proxy, not gauge truth.

Legacy Rainfall Stress is a fixed experimental heuristic, not calibrated Philippine warning criteria or flood prediction. It does not model drainage, topography, rivers, or tides. Do not interpret retained integration code as evidence of an active trained model.

`npm run db:seed` executes `supabase db reset` for local development; it is not a production seed command. `npm run ingest` invokes the retained `ingest-weather` function. `npm run ml:evaluate` wraps the standalone evaluation script; see its README for dataset and month prerequisites.

## Repository structure

```text
app/                 App Router pages, shared dashboard layout, server APIs
components/          TANOM interface and retained rainfall-dashboard components
lib/tanom/           Geography, weather contracts, crops, calculations, AI controls
lib/                 Shared utilities and legacy rainfall/Supabase/ML integration
public/              Bundled geography, licenses, and TANOM branding
scripts/             Geography/data preparation utilities
supabase/            Database migrations and ingestion Edge Function
ml/                  Standalone Cebu Ridge experiment and Python tests
tests/               TypeScript unit tests and Playwright browser scenarios
```

## Attribution

Weather and climate data are supplied through Open-Meteo and its underlying model providers. Preserve their attribution when publishing data; review provider terms before commercial use or increased traffic.

Nationwide municipality/province-area geometry uses geoBoundaries gbOpen PHL ADM2/ADM3, pinned release `9469f09`, under CC BY 3.0 IGO. Source-vintage boundaries are not a current legal boundary determination. See [nationwide boundary attribution](public/philippines-boundaries-LICENSE.md), [Cebu boundary attribution](public/cebu-boundaries-LICENSE.md), and [Cebu places attribution](public/cebu-places-LICENSE.md).

The retained `public/philippines.geojson` overview outline derives from Natural Earth, public domain, 1:50m Admin 0 countries. Maps are contextual overviews, not navigational or legal boundary references. IBM Plex Sans is self-hosted through `@fontsource/ibm-plex-sans`; its license is included in the package.
