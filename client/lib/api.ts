// API utility functions for making authenticated requests

const API_BASE = '/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('drishti_token');
};

// Create headers with auth token
const createHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: createHeaders(options.headers as Record<string, string>),
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (fetchErr) {
    console.error('Network request failed:', fetchErr);
    throw new Error('Network request failed. Please check your connection or try again.');
  }

  let data: any = undefined;
  try {
    data = await response.json();
  } catch (err) {
    // If body was already read or not valid JSON, try text and parse safely
    try {
      const txt = await response.text();
      data = txt ? JSON.parse(txt) : {};
    } catch (err2) {
      // could not parse body, fallback to empty object
      data = {};
    }
  }

  if (!response.ok) {
    // Try to surface a useful error message
    const message = (data && (data.error || data.message)) || response.statusText || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }

  return data;
};

// Specific API functions

// Ideas API
export const ideasApi = {
  // Get all ideas (for investors)
  getAll: (params?: {
    category?: string;
    stage?: string;
    minScore?: number;
    sort?: string;
    search?: string;
    featured?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return apiRequest<{ ideas: any[]; demo?: boolean; message?: string }>(`/ideas${query ? `?${query}` : ''}`);
  },

  // Get user's own ideas
  getMyIdeas: async () => {
    try {
      return await apiRequest<{ ideas: any[] }>('/ideas/my-ideas');
    } catch (err) {
      // Network or server error - fall back to locally cached ideas if available
      try {
        console.warn('getMyIdeas failed, returning local cached ideas', err);
        const key = 'local_ideas';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        return { ideas: existing };
      } catch (e) {
        throw err;
      }
    }
  },

  // Get idea by ID
  getById: (id: string) => apiRequest<{ idea: any }>(`/ideas/${id}`),

    // AI review (suggestions + AI-similar ideas)
    aiReview: (id: string) => apiRequest<{ suggestions: string[]; review?: any; similarIdeas: any[] }>(`/ideas/${id}/ai-review`),

  // Create new idea
  create: (ideaData: any) => apiRequest<{ message: string; idea: any }>('/ideas', {
    method: 'POST',
    body: JSON.stringify(ideaData),
  }),

  // Update idea
  update: (id: string, ideaData: any) => apiRequest<{ message: string; idea: any }>(`/ideas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(ideaData),
  }),

  // Express interest
  expressInterest: (id: string, message?: string) => apiRequest<{ message: string; idea: any }>(`/ideas/${id}/interest`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),

  // Delete idea
  delete: (id: string) => apiRequest<{ message: string }>(`/ideas/${id}`, {
    method: 'DELETE',
  }),
};

// Chat API
export const chatApi = {
  // Create or get conversation for idea with optional peer
  createOrGetConversation: (payload: { ideaId: string; peerId?: string }) =>
    apiRequest<{ conversation: any }>(`/chat/conversations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // List conversations for current user
  listConversations: () => apiRequest<{ conversations: any[] }>(`/chat/conversations`),

  // Get messages
  getMessages: (conversationId: string) =>
    apiRequest<{ messages: any[] }>(`/chat/conversations/${conversationId}/messages`),

  // Send message
  sendMessage: (conversationId: string, text: string) =>
    apiRequest<{ message: any }>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    }),
};

// Notifications API
export const notificationsApi = {
  // Get notifications
  getAll: (params?: { read?: boolean; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return apiRequest<{
      notifications: any[];
      unreadCount: number;
      hasMore: boolean;
      demo?: boolean;
      message?: string;
    }>(`/notifications${query ? `?${query}` : ''}`);
  },

  // Mark as read
  markAsRead: (id: string) => apiRequest<{ message: string; notification: any }>(`/notifications/${id}/read`, {
    method: 'PUT',
  }),

  // Mark all as read
  markAllAsRead: () => apiRequest<{ message: string }>('/notifications/mark-all-read', {
    method: 'PUT',
  }),

  // Delete notification
  delete: (id: string) => apiRequest<{ message: string }>(`/notifications/${id}`, {
    method: 'DELETE',
  }),

  // Create notification (for testing)
  create: (notificationData: any) => apiRequest<{ message: string; notification: any }>('/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  }),
};

// Auth API
export const authApi = {
  // Update profile
  updateProfile: (profileData: any) => apiRequest<{ message: string; user: any }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  // Get current user
  getMe: () => apiRequest<{ user: any }>('/auth/me'),
};

// Health check
export const healthCheck = () => apiRequest<{ status: string; timestamp: string; uptime: number }>('/health');
