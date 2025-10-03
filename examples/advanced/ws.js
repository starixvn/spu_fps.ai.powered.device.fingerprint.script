// sw.js

const CACHE_NAME = 'uuid-cache-v1';
const UUID_CACHE_KEY = 'user-uuid';

// Hàm tạo UUID đơn giản
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_UUID') {
        caches.open(CACHE_NAME).then((cache) => {
            cache.match(UUID_CACHE_KEY).then((response) => {
                if (response) {
                    response.text().then((uuid) => {
                        event.source?.postMessage({ type: 'UUID_RESPONSE', uuid: uuid });
                    });
                } else {
                    const newUUID = generateUUID();
                    cache.put(UUID_CACHE_KEY, new Response(newUUID));
                    event.source?.postMessage({ type: 'UUID_RESPONSE', uuid: newUUID });
                }
            });
        });
    }
});