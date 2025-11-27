import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/';
const AI_BASE_URL =
  import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling (e.g., token expiration)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('userId');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

// AI Chat API functions (use AI_BASE_URL)
const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function buildUserChatRequest(overrides) {
  if (overrides) {
    return overrides;
  }

  const userId = localStorage.getItem('userId');
  const jwtToken = localStorage.getItem('access_token');

  if (!userId || !jwtToken) {
    throw new Error('Missing authentication context for chat.');
  }

  const { data } = await apiClient.get(`/users/${userId}`);
  const { email = '', username = '', firstName, first_name } = data || {};

  return {
    user_id: Number(userId),
    email,
    username,
    first_name: firstName ?? first_name ?? '',
    jwt_token: jwtToken,
  };
}

export async function createChat(userContextOverrides) {
  const payload = await buildUserChatRequest(userContextOverrides);
  const { data } = await aiClient.post('/chats', payload);
  return data;
}

export async function getChatHistory(chatId) {
  const { data } = await aiClient.get(`/chats/${chatId}`);
  return data;
}

export async function sendChatMessage(chatId, message) {
  const { data } = await aiClient.post(`/chats/${chatId}/message`, {
    message,
  });
  return data;
}

export default apiClient;
