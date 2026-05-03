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

