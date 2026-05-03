addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Worker that looks up slug in GAS Web App and issues a 302 redirect to the target.
 * Expects GAS_URL environment variable to point to the GAS webapp (read endpoint).
 */
async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\//, '') // remove leading /

  // if path empty or admin, forward to Pages or return simple info
  if (!path || path === 'admin' || path === 'index.html') {
    return fetch(request) // let Pages or origin handle it
  }

  const GAS_URL = GLOBAL_GAS_URL || Deno.env?.GAS_URL || (typeof GAS_URL !== 'undefined' && GAS_URL)
  // Prefer environment binding `GAS_URL` provided via wrangler.toml
  const gasUrl = GAS_URL || GLOBAL_GAS_URL || ''
  if (!gasUrl) return new Response('GAS_URL not configured', { status: 500 })

  try {
    const res = await fetch(gasUrl + '?action=read')
    if (!res.ok) return new Response('Failed to fetch mapping', { status: 502 })
    const list = await res.json()
    if (!Array.isArray(list)) return new Response('Invalid data from GAS', { status: 502 })

    const item = list.find(i => i.slug === path)
    if (!item) return new Response('Not Found', { status: 404 })

    // Issue a proper 302 redirect to target
    return Response.redirect(item.target, 302)
  } catch (err) {
    return new Response('Error: ' + err.toString(), { status: 500 })
  }
}

// Expose GAS_URL binding name for Wrangler (wrangler.toml should set kv or env)
const GLOBAL_GAS_URL = typeof GAS_URL === 'string' ? GAS_URL : undefined
