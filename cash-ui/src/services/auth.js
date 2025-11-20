import apiClient from '../api/api';

export async function logoutUser(jwt, userId) {
  try {
    const res = await apiClient.post('/users/logout', {
      jwt,
      userId: Number(userId),
    });
    if (res.data?.success) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('userId');
      return { success: true };
    } else {
      return { success: false, message: res.data?.message || 'Logout failed' };
    }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Logout failed',
    };
  }
}
