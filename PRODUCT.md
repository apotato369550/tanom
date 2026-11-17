# TANOM

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: individual Philippine growers checking local conditions and growing context.
Secondary: agricultural advisers supporting growers.

## Product Purpose

Help growers understand local weather and growing context. Success is clearer understanding, not prescribed farm-work or planting actions. Farm-work recommendations are not part of the current product.

## Operating Context

Users choose a Philippine location through map/list selection or optional browser geolocation, inspect current and forecast conditions, and explore environmental and seasonal context in separate tools. English and Cebuano are supported.

## Capabilities and Constraints

- Landing page at `/`; overview at `/dashboard`; distinct Conditions, Environment, and Seasonal Planning pages. Do not merge their functionality.
- Current conditions, hourly and seven-day forecasts, modeled soil/environmental estimates, crop/climate comparisons, historical climate profiles, and seasonal outlooks.
- Forecasts and soil estimates are modeled data, not field measurements. Historical climate and seasonal outlooks are not precise daily predictions.
- Crop comparisons do not guarantee suitability; local soil, drainage, irrigation, and cultivar conditions may be unknown.
- No flood prediction. Official warnings belong to PAGASA and local authorities.
- Basic weather tools require no account or credentials. Optional on-demand AI reports require server configuration and remain explicitly opt-in with data-sharing disclosure.
- ML is a coming-soon page, not a deployed prediction service.
- Preserve unavailable/error states rather than inventing measurements or silently substituting sample weather.
- Existing Next.js server runtime and API routes must remain functional; static export is inappropriate.

## Brand Commitments

TANOM is the public product name; the repository retains `rainwatch-ph`. Use plain, explanatory language without invented claims. The user selected a warm, grower-first direction; visual specifications belong outside this product record.

## Evidence on Hand

Repository contains working tools, Open-Meteo integrations, bundled Philippine geometry, TANOM SVG marks, and deterministic test fixtures. Landing preview illustrations are not live weather. Do not treat fixtures as production evidence or invent endorsements, adoption figures, or performance statistics.

## Product Principles

- Explain conditions and context without prescribing farm work.
- Keep tools distinct and their data meanings explicit.
- Preserve uncertainty, missing inputs, and model limitations.
- Make the product usable in English and Cebuano, on desktop and mobile web.

## Accessibility & Inclusion

Retain keyboard access, visible focus, named controls, reduced-motion support, and responsive layouts. Automated axe checks are part of existing browser verification; no additional formal compliance claim is established.
