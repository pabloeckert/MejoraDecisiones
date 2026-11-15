const CACHE_NAME = 'mejora-decisiones-os-v5.7.0'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/MejoraDecisiones/',
  '/MejoraDecisiones/index.html',
]

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {
        // Fallback gracefully if some base paths differ locally vs GitHub Pages
      })
    )
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: network-first for HTML, stale-while-revalidate for APIs, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // HTML: network-first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/MejoraDecisiones/') || caches.match('/')))
    )
    return
  }

  // APIs externas (DolarAPI, Frankfurter, Banco Mundial, BCRA, INDEC): Stale-while-revalidate para uso offline
  if (
    url.hostname.includes('dolarapi.com') ||
    url.hostname.includes('frankfurter.app') ||
    url.hostname.includes('worldbank.org') ||
    url.hostname.includes('bcra.gob.ar') ||
    url.hostname.includes('datos.gob.ar')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            }
            return networkResponse
          })
          .catch(() => cached)

        return cached || networkFetch
      })
    )
    return
  }

  // Static Assets (JS, CSS, fonts, SVG): Cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
