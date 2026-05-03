# redirect-att

Simple shortlink manager using Google Apps Script (GAS) + Spreadsheet as datastore.

Quick setup
1. Set `GAS_URL` in `index.html` to your deployed Web App URL (see step 2).
2. Deploy GAS (example using `clasp`):

```bash
# login once
npx @google/clasp login
# push and deploy (example)
npx @google/clasp push
npx @google/clasp deploy --versionNumber 1 --description "webapp"
```

Make sure the Apps Script project is deployed as Web App with access `Anyone, even anonymous` (see `appsscript.json` setting).

Frontend (Cloudflare Pages)
- You can host `index.html` on Cloudflare Pages or any static host. Ensure the hosting serves the same file for `/admin` path (Pages default will work if you set routes to fallback to `index.html`).

Optional: Cloudflare Worker
- If you use a Worker to handle redirects at the edge, create a `wrangler.toml` and a simple Worker that proxies path to GAS (or reads from KV). Example commands:

```bash
# login to Cloudflare
wrangler login
# publish worker
wrangler publish
```

Notes
- Credentials are stored in the `Creds` sheet (see `gas/Kode.js`).
- The admin UI expects the GAS web app to implement `?action=read`, POST `{action: "login"}`, and POST `{action: "add"}` as implemented in `gas/Kode.js`.

If you want, I can:
- Replace the `REPLACE_WITH_YOUR_GAS_URL` placeholder automatically with your deployed URL.
- Scaffold a Worker and `wrangler.toml` to serve redirects and/or connect to a custom domain.

Status:
- Point 1 (improve frontend UI): Completed — see `index.html` update (admin SPA, routing `/admin`, login UX).

Cloudflare Worker (scaffolded)
- A Worker template has been added at `worker/index.js` that fetches mapping from the GAS `?action=read` endpoint and issues 302 redirects for matched slugs.
- `wrangler.toml` has been added (set your `account_id` and optionally `routes` before publishing). The file includes `GAS_URL` pointing to the latest GAS deployment.

Deploying the Worker
1. Install wrangler and login:

```bash
npm install -g wrangler
wrangler login
```

2. Edit `wrangler.toml`: set `account_id` and uncomment `routes` if you want to bind to `go.attawwabin.my.id/*`.

3. Publish the worker:

```bash
wrangler publish
```

Notes about custom domain
- To use a custom domain (`go.attawwabin.my.id`) point the DNS CNAME to `workers.dev` per Cloudflare docs and add a route in `wrangler.toml` or Cloudflare dashboard.

Published Worker
- Deployed preview URL: https://redirect-att-worker.kutaweb.workers.dev

To bind your custom domain `go.attawwabin.my.id` to the Worker:

- Ensure the domain's zone is added to the same Cloudflare account (DNS management).
- Add a CNAME from `go.attawwabin.my.id` to `workers.dev` per Cloudflare docs.
- Add a route for the domain either in `wrangler.toml` (routes) or in the Cloudflare dashboard's Workers -> Routes.

If you want me to bind the custom domain now, I can attempt it — I will try and report back if Cloudflare account/zone are required.


