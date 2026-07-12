import api from '@/lib/axios';
import type { 
  LoginFormValues, 
  RegisterFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues
} from '@/lib/validators/auth.schema';

// ── Types returned by the server ─────────────────────────────────────────────
export interface ResponseEnvelope<T> {
  data: T;
  errors: string[];
  statusCode: number;
}

// ── Account service ───────────────────────────────────────────────────────────
export const accountService = {
  /** Authenticate and return a JWT token. */
  async login(data: LoginFormValues): Promise<ResponseEnvelope<string>> {
    const payload = {
      userName: data.userNameOrEmail,
      password: data.password,
    };
    const res = await api.post<ResponseEnvelope<string>>('/Account/login', payload);
    return res.data;
  },

  /** Register a new account. confirmPassword is derived from password. */
  async register(data: RegisterFormValues): Promise<ResponseEnvelope<string>> {
    const payload = {
      userName: data.userName,
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.password, // Hidden in UI, derived from password
    };
    const res = await api.post<ResponseEnvelope<string>>('/Account/register', payload);
    return res.data;
  },

  /** Forgot password link request. */
  async forgotPassword(email: string): Promise<ResponseEnvelope<string>> {
    const res = await api.delete<ResponseEnvelope<string>>('/Account/ForgotPassword', { params: { Email: email } });
    return res.data;
  },

  /** Reset password with token. */
  async resetPassword(data: ResetPasswordFormValues): Promise<ResponseEnvelope<string>> {
    const res = await api.delete<ResponseEnvelope<string>>('/Account/ResetPassword', {
      params: {
        Token: data.token,
        Email: data.email,
        Password: data.password,
        ConfirmPassword: data.confirmPassword,
      },
    });
    return res.data;
  }
};
