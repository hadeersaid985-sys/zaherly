# Architecture rules
- Persist site onboarding separately from reports; require completed setup for customer analyses so reviewed market/questions/competitors stay attached to each website.
- Keep seven-day trial timestamps server-managed and immutable on restart; use the shared trial-state helper for tool access and display.
- Keep the homepage redesign scoped to presentation in the index route and homepage-prefixed global styles so customer and admin workflows remain unchanged.
- Reuse the existing analysis server function and controlled form for both the quick URL entry and full analysis submission to avoid divergent scan workflows.
- Import generated homepage media as bundled assets so it is available in both preview and published builds.
- Share lead-stage values through a browser-safe module so admin validation and its tests use the same allowed stages.