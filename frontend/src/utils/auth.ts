import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export async function verifyEmail(token: string): Promise<void> {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
}

export async function resendVerification(): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  const response = await api.post(
    '/auth/resend-verification',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function checkEmailVerification(): Promise<boolean> {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await api.get('/auth/verification-status', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.verified;
  } catch {
    return false;
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function validateResetToken(token: string): Promise<void> {
  const response = await api.get(`/auth/reset-password/validate/${token}`);
  return response.data;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await api.post('/auth/reset-password', {
    token,
    password: newPassword,
  });
  return response.data;
} 