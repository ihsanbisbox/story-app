export const API_CONFIG = {
    BASE_URL: process.env.API_BASE_URL || 'https://story-api.dicoding.dev/v1',
    MAP_API_KEY: process.env.MAP_API_KEY || '',
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',
    ENDPOINTS: {
      REGISTER: '/register',
      LOGIN: '/login',
      STORIES: '/stories',
      STORIES_GUEST: '/stories/guest',
      STORY_DETAIL: (id) => `/stories/${id}`,
      SUBSCRIBE: '/notifications/subscribe',
      UNSUBSCRIBE: '/notifications/subscribe',
    }
  };