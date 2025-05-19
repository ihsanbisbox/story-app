export function showLocalNotification(title, body, swRegistration) {
  const options = {
    body,
    icon: "/images/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  swRegistration.showNotification(title, options);
}
