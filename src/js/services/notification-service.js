import { API_CONFIG } from '../config/api-config';
import ApiUtil from '../utils/api';

class NotificationService {
  static async init(registration) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.subscribe(registration);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  static async subscribe(registration) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(API_CONFIG.VAPID_PUBLIC_KEY)
      });

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
        }
      };

      await ApiUtil.post(API_CONFIG.ENDPOINTS.SUBSCRIBE, subscriptionData);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  static async showNotification(title, options) {
    if ('Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    }
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default NotificationService;