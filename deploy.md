# Deploy — local to live in a few minutes

Two environments: your computer (test here) and the cloud (the real URL).
Build and test locally, then ship. The step-by-step lives in the **`launch`
skill** — just tell Claude "deploy this" and it runs it. This page is the human summary.

## 1. Test locally
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000/pages/your-page.html`. Check it at full width AND a
narrow mobile width (390px). Only ship when both look right.

## 2. Go live (Cloudflare — free, one command)
One-time: a free Cloudflare account + an API token
(<https://dash.cloudflare.com/profile/api-tokens> → *Create Token* → **Edit
Cloudflare Workers**). Put the token + your Account ID in `.env` (see
`.env.example`). Then:
> deploy this

Claude runs `wrangler deploy` and hands you the live `…workers.dev` URL. Add a
custom domain later in the Cloudflare dashboard. No monthly fee; you own the code.

## The one gotcha: ship the frames
A scroll-hero renders from the images in `assets/frames/`. Those files MUST be
uploaded, or the animation disappears in production (the page loads but the
product never shows). They are not gitignored — only the raw working clips are.
If the live hero is blank, this is almost always why.

## Prefer another host?
It's plain static files, so anything works — **Netlify** / **Vercel** (drag-drop
or connect a GitHub repo for auto-deploy on push) or **GitHub Pages**. Same
gotcha everywhere: commit `assets/frames/**`.
