import { http } from "@/lib/axios";
import type {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "@/types/auth.types";

/**
 * Swagger tag: Account (5 endpoints).
 * ForgotPassword / ResetPassword are DELETE with query params — unusual, but
 * that is what the backend exposes. Passwords are never logged.
 */
export const accountService = {
  register: (dto: RegisterDto) => http.post<string>("/Account/register", dto),

  /** Returns the JWT as a bare string (Response<string>). */
  login: (dto: LoginDto) => http.post<string>("/Account/login", dto),

  forgotPassword: (email: string) =>
    http.delete<string>("/Account/ForgotPassword", { Email: email }),

  resetPassword: (dto: ResetPasswordDto) =>
    http.delete<string>("/Account/ResetPassword", {
      Token: dto.token,
      Email: dto.email,
      Password: dto.password,
      ConfirmPassword: dto.confirmPassword,
    }),

  changePassword: (dto: ChangePasswordDto) =>
    http.put<string>("/Account/ChangePassword", undefined, {
      OldPassword: dto.oldPassword,
      Password: dto.password,
      ConfirmPassword: dto.confirmPassword,
    }),
};
