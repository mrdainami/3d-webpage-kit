---
name: launch
description: Ship the site live to a real URL on Cloudflare (free) via wrangler — no build step, no monthly fee. Serves the kit's static files as a Cloudflare Worker with static assets. Use when the user says "deploy" / "launch" / "put this live". Any static host works too (Netlify / Vercel / GitHub Pages) — Cloudflare is the default because it's free and one command.
---

# launch

Deploys the kit's plain HTML/CSS/JS to Cloudflare's edge as a static-assets
Worker. Proven flow — this is exactly how the example demos went live.

## Before shipping (2 checks)
1. **Preview locally** and confirm at full width AND 390px: `python3 -m http.server 8000`.
2. **The one gotcha — ship the frames.** A scroll-hero renders from the images in
   `assets/frames/**`. Those MUST be uploaded, or the hero is blank in production
   (page loads, product never appears). They are NOT gitignored (only the raw
   working clips are). If the live hero is blank, this is almost always why.

## One-time setup
- Free Cloudflare account. Create a token at
  <https://dash.cloudflare.com/profile/api-tokens> → *Create Token* → **Edit Cloudflare Workers**.
- Put it in `.env`: `CLOUDFLARE_API_TOKEN=…` and `CLOUDFLARE_ACCOUNT_ID=…`
  (the Account ID is on the Cloudflare dashboard home).

## wrangler.jsonc (create once at the kit root if missing)
```jsonc
{
  "name": "my-site",                 // becomes my-site.<subdomain>.workers.dev
  "compatibility_date": "2026-01-01",
  "assets": { "directory": "./" }    // serve the whole kit as static files
}
```
> Clean root URL: to serve a page at `/` instead of `/pages/foo.html`, copy that
> page to `index.html` at the kit root before deploying.

## Deploy
```bash
set -a; source .env; set +a          # load the Cloudflare token/account into env
npx wrangler@4 deploy
```
Wrangler prints the live URL (`https://my-site.<subdomain>.workers.dev`). Open it,
hard-refresh, and scrub the hero to confirm the frames uploaded.

## Redeploy
Same command any time you change a page — it re-uploads only what changed.

## Custom domain
Cloudflare dashboard → Workers & Pages → your worker → *Settings* → *Domains &
Routes* → add your domain. No platform fee; you own the code and the domain.

## Other hosts (all fine — it's just static files)
- **Netlify / Vercel:** drag-and-drop the folder, or connect a GitHub repo (auto-deploy on push).
- **GitHub Pages:** push to a repo, enable Pages on the branch.
Whatever the host: **commit `assets/frames/**`** or the hero goes blank.
