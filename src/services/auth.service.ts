import { http } from "@/lib/axios";
import type {
  ChangePasswordDto,
  CheckUsernameDto,
  ForgotPasswordDto,
  LoginDto,
  MessageDto,
  RefreshDto,
  RegisterDto,
  ResendCodeDto,
  ResetPasswordDto,
  ResetTokenDto,
  TokensDto,
  UsernameAvailableDto,
  VerifyCodeDto,
} from "@/types/api.types";

/**
 * Swagger tag: auth (11 endpoints).
 *
 * Password reset is a four-step flow now: forgot-password mails a 6-digit code,
 * verify-code trades it for a single-use resetToken (15 min), reset-password
 * spends that token. `resend-code` is rate-limited to once a minute (429).
 *
 * `refresh` and `logout` are NOT called from here — tokens live in httpOnly
 * cookies, so only the server touches them (`lib/auth-tokens.ts`, the proxy, and
 * the session route). They are typed here for completeness of the tag.
 */
export const authService = {
  register: (dto: RegisterDto) => http.post<TokensDto>("/auth/register", dto),

  /** `login` accepts userName OR email OR phone — one field, three shapes. */
  login: (dto: LoginDto) => http.post<TokensDto>("/auth/login", dto),

  /** Live validation for the register form. */
  checkUsername: (dto: CheckUsernameDto) =>
    http.post<UsernameAvailableDto>("/auth/check-username", dto),

  forgotPassword: (dto: ForgotPasswordDto) => http.post<MessageDto>("/auth/forgot-password", dto),

  resendCode: (dto: ResendCodeDto) => http.post<MessageDto>("/auth/resend-code", dto),

  /** Trades the emailed code for a single-use resetToken. */
  verifyCode: (dto: VerifyCodeDto) => http.post<ResetTokenDto>("/auth/verify-code", dto),

  resetPassword: (dto: ResetPasswordDto) => http.post<MessageDto>("/auth/reset-password", dto),

  changePassword: (dto: ChangePasswordDto) => http.put<MessageDto>("/auth/change-password", dto),
};

/** Server-side only — the browser never holds a refresh token. */
export type { RefreshDto };
