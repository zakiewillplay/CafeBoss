self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
    let orderData = {
        title: 'New Cafe Order!',
        body: 'You have received a new order.',
        sound: 'notification.mp3'
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            orderData.title = payload.title || orderData.title;
            orderData.body = payload.body || orderData.body;
        } catch (e) {
            orderData.body = event.data.text();
        }
    }

    const options = {
        body: orderData.body,
        vibrate:,
        sound: orderData.sound,
        tag: 'new-order-' + Date.now(),
        renotify: true,
        data: { url: './dashboard.html' }
    };

    event.waitUntil(self.registration.showNotification(orderData.title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const targetUrl = event.notification.data ? event.notification.data.url : './dashboard.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes('dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
