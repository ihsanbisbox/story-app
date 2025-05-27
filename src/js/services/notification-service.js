import { API_CONFIG } from '../config/api-config';
import ApiUtil from '../utils/api';

class NotificationService {
  static async init(registration) {
    try {
      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.log('Push notifications are not supported');
        return false;
      }

      const permission = await Notification.requestPermission();
      console.log('Notification permission status:', permission);
      
      if (permission === 'granted') {
        await this.subscribe(registration);
        return true;
      } else if (permission === 'denied') {
        console.log('Notification permission denied');
        return false;
      } else {
        console.log('Notification permission default (not granted)');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  static async subscribe(registration) {
    try {
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        // Kirim subscription ke server untuk memastikan sinkronisasi
        await this.sendSubscriptionToServer(existingSubscription);
        return existingSubscription;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(API_CONFIG.VAPID_PUBLIC_KEY)
      });

      console.log('Successfully subscribed to push notifications');
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      
      // Handle specific errors
      if (error.name === 'NotSupportedError') {
        console.error('Push messaging is not supported');
      } else if (error.name === 'PermissionDeniedError') {
        console.error('Permission for notifications was denied');
      } else if (error.name === 'InvalidStateError') {
        console.error('Service worker is in invalid state');
      }
      
      throw error;
    }
  }

  static async unsubscribe(registration) {
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        console.log('Successfully unsubscribed from push notifications');
        return true;
      }
      console.log('No active subscription found');
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }

  static async sendSubscriptionToServer(subscription) {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      console.log('Sending subscription to server...');
      const response = await ApiUtil.post(API_CONFIG.ENDPOINTS.SUBSCRIBE, subscriptionData);
      console.log('Subscription sent to server successfully');
      return response;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      
      // Jika endpoint tidak ada, jangan throw error
      // Agar tidak mengganggu functionality lainnya
      if (error.status === 404) {
        console.warn('Subscription endpoint not found on server. Push notifications may not work properly.');
        return null;
      }
      
      throw error;
    }
  }

  static async removeSubscriptionFromServer(subscription) {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint
      };

      console.log('Removing subscription from server...');
      const response = await ApiUtil.post(API_CONFIG.ENDPOINTS.UNSUBSCRIBE, subscriptionData);
      console.log('Subscription removed from server successfully');
      return response;
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      
      // Jika endpoint tidak ada, jangan throw error
      if (error.status === 404) {
        console.warn('Unsubscribe endpoint not found on server.');
        return null;
      }
      
      throw error;
    }
  }

  static arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
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

  // Helper method untuk check subscription status
  static async getSubscriptionStatus() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { supported: false, subscribed: false, permission: 'default' };
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return { supported: true, subscribed: false, permission: Notification.permission };
      }

      const subscription = await registration.pushManager.getSubscription();
      return {
        supported: true,
        subscribed: !!subscription,
        permission: Notification.permission,
        subscription: subscription
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return { supported: false, subscribed: false, permission: 'default', error: error.message };
    }
  }
}

export default NotificationService;