import axios from 'axios';
import type { 
  LoginFormValues, 
  RegisterFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues
} from '@/lib/validators/auth.schema';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT from localStorage on every request ────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ig_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Types returned by the server ─────────────────────────────────────────────
export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  message?: string;
}

// ── Account service ───────────────────────────────────────────────────────────
export const accountService = {
  /** Authenticate and return a JWT token. */
  async login(data: LoginFormValues): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/api/account/login', data);
    return res.data;
  },

  /** Register a new account. confirmPassword is derived from password. */
  async register(data: RegisterFormValues): Promise<RegisterResponse> {
    const payload = {
      email: data.email,
      password: data.password,
      confirmPassword: data.password,   // matches backend DTO; not shown in UI
      fullName: data.fullName,
      userName: data.userName,
    };
    const res = await api.post<RegisterResponse>('/api/account/register', payload);
    return res.data;
  },

  /** Forgot password link request. */
  async forgotPassword(email: string) {
    return api.delete('/api/Account/ForgotPassword', { params: { Email: email } });
  },

  /** Reset password with token. */
  async resetPassword(data: ResetPasswordFormValues) {
    return api.delete('/api/Account/ResetPassword', {
      params: {
        Token: data.token,
        Email: data.email,
        Password: data.password,
        ConfirmPassword: data.confirmPassword,
      },
    });
  }
};
