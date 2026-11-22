/* Service Worker: кеширование ресурсов и офлайн-доступ к страницам. */

const PREFIX = 'stylish-beard:' + self.registration.scope + ':';
const CACHE = PREFIX + 'v3';

// Ресурсы для предварительного кеширования
const RESOURCES = [
    './assets/css/pages.css',
    './assets/css/styles.css',

    './assets/fonts/OFL-Cormorant-Garamond.txt',
    './assets/fonts/OFL-Manrope.txt',
    './assets/fonts/OFL-Oswald.txt',
    './assets/fonts/cormorant-garamond-500-italic.ttf',
    './assets/fonts/cormorant-garamond-500-normal.ttf',
    './assets/fonts/cormorant-garamond-600-normal.ttf',
    './assets/fonts/fonts.css',
    './assets/fonts/manrope-400.ttf',
    './assets/fonts/manrope-500.ttf',
    './assets/fonts/manrope-600.ttf',
    './assets/fonts/manrope-700.ttf',
    './assets/fonts/oswald-500.ttf',
    './assets/fonts/oswald-600.ttf',
    './assets/fonts/oswald-700.ttf',

    './assets/icons/barbershop-emblem.svg',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/icons/icon-maskable-512.png',

    './assets/images/beard.jpg',
    './assets/images/care.jpg',
    './assets/images/complex.jpg',
    './assets/images/haircut.jpg',
    './assets/images/hero.jpg',
    './assets/images/master-alexey.jpg',
    './assets/images/master-ilya.jpg',
    './assets/images/master-mikhail.jpg',
    './assets/images/review-client-1.jpg',
    './assets/images/review-client-2.jpg',
    './assets/images/review-client-3.jpg',
    './assets/images/tools.jpg',

    './assets/js/app.js',
    './assets/js/booking.js',
    './assets/js/cart.js',
    './assets/js/data.js',
    './assets/js/pages.js',
    './assets/js/pwa.js',

    './booking.html',
    './cart.html',
    './catalog.html',
    './coming-soon.html',
    './contacts.html',
    './index.html',
    './manifest.webmanifest',
    './service.html',
    './team.html'
];

// Установка и предварительное кеширование
self.addEventListener('install', event =>
{
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(RESOURCES))
    );
});

// Активация и удаление старых кешей
self.addEventListener('activate', event =>
{
    event.waitUntil((async () =>
    {
        for (const key of await caches.keys())
        {
            if (key.startsWith(PREFIX) && key !== CACHE)
            {
                await caches.delete(key);
            }
        }

        await self.clients.claim();
    })());
});

// Обработка запросов
self.addEventListener('fetch', event =>
{
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET' ||
        url.origin !== self.location.origin ||
        !url.href.startsWith(self.registration.scope))
    {
        return;
    }

    // Для страниц сначала пробуем сеть, затем кеш
    if (request.mode === 'navigate')
    {
        event.respondWith((async () =>
        {
            try
            {
                const response = await fetch(request);

                if (response.ok)
                {
                    return response;
                }
            }
            catch
            {
                // Если сеть недоступна, используем кеш.
            }

            const cache = await caches.open(CACHE);
            const relative = url.pathname.slice(new URL(self.registration.scope).pathname.length) || 'index.html';
            const cachedPage = await cache.match(new URL(relative, self.registration.scope).href, {ignoreSearch: true});

            return cachedPage || new Response('Страница не найдена',
            {
                status: 404,
                headers: {'Content-Type': 'text/plain; charset=utf-8'}
            });
        })());
    }
    else
    {
        // Для остальных ресурсов сначала используем кеш
        event.respondWith((async () =>
        {
            const cache = await caches.open(CACHE);
            return await cache.match(request) || fetch(request);
        })());
    }
});
