// 1. Listen for the push event (sent from your server/database trigger)
self.addEventListener('push', function(event) {
  let orderData = {
    title: 'New Cafe Order!',
    body: 'You have received a new order on Cafe Boss.',
    sound: 'notification.mp3', // Path to your alert sound
    cafeId: null
  };

  // If the push event contains data, parse it
  if (event.data) {
    try {
      const payload = event.data.json();
      orderData.title = payload.title || orderData.title;
      orderData.body = payload.body || orderData.body;
      if (payload.cafeId) orderData.cafeId = payload.cafeId;
    } catch (e) {
      orderData.body = event.data.text();
    }
  }

  // Options for how the notification looks and behaves
  const options = {
    body: orderData.body,
    icon: '/icon.png',         // Path to your cafe boss logo/icon
    badge: '/badge.png',       // Small icon for mobile status bars
    vibrate:, // High-intensity vibration pattern
    sound: orderData.sound,    // Requests the OS to play the sound
    tag: 'new-order-' + (orderData.cafeId || Date.now()), // Prevents duplicate alerts
    renotify: true,            // Alerts the user even if a previous notification is active
    data: {
      url: '/' // The page to open when clicked
    }
  };

  // Force the device to display the notification immediately
  event.waitUntil(
    self.registration.showNotification(orderData.title, options)
  );
});

// 2. Handle what happens when the cafe owner clicks the notification
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification banner

  // Get the URL we saved in the data object above
  const targetUrl = event.notification.data.url;

  // Check if the cafe app is already open in the background
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If it's already open, just switch focus to it
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If it's closed, open a brand new window/tab to the dashboard
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
