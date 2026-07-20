import { http } from "@/lib/axios";
import type {
  BackupCodesDto,
  ChangePasswordDto,
  CheckUsernameDto,
  Disable2faDto,
  Enable2faDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutAllResultDto,
  MessageDto,
  RefreshDto,
  RegisterDto,
  ResendCodeDto,
  ResetPasswordDto,
  ResetTokenDto,
  SessionDto,
  TokensDto,
  TwoFactorRequiredDto,
  TwoFactorSetupDto,
  UsernameAvailableDto,
  Verify2faDto,
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

  /**
   * `login` accepts userName OR email OR phone — one field, three shapes.
   *
   * Answers real tokens, OR — when the account has 2FA on — a ticket that
   * `verify2fa` trades for tokens. See `TwoFactorRequiredDto`.
   */
  login: (dto: LoginDto) => http.post<TokensDto | TwoFactorRequiredDto>("/auth/login", dto),

  /** Live validation for the register form. */
  checkUsername: (dto: CheckUsernameDto) =>
    http.post<UsernameAvailableDto>("/auth/check-username", dto),

  forgotPassword: (dto: ForgotPasswordDto) => http.post<MessageDto>("/auth/forgot-password", dto),

  resendCode: (dto: ResendCodeDto) => http.post<MessageDto>("/auth/resend-code", dto),

  /** Trades the emailed code for a single-use resetToken. */
  verifyCode: (dto: VerifyCodeDto) => http.post<ResetTokenDto>("/auth/verify-code", dto),

  resetPassword: (dto: ResetPasswordDto) => http.post<MessageDto>("/auth/reset-password", dto),

  changePassword: (dto: ChangePasswordDto) => http.put<MessageDto>("/auth/change-password", dto),

  /** Returns the secret + otpauth URI for a QR code — 2FA is not yet ON after this. */
  setup2fa: () => http.post<TwoFactorSetupDto>("/auth/2fa/setup"),

  /** Confirms the code from the authenticator app → turns 2FA on, returns backup codes ONCE. */
  enable2fa: (dto: Enable2faDto) => http.post<BackupCodesDto>("/auth/2fa/enable", dto),

  /** Needs a live code (or a backup code) to turn 2FA back off. */
  disable2fa: (dto: Disable2faDto) => http.post<MessageDto>("/auth/2fa/disable", dto),

  /**
   * Second login step: the ticket from `login` + a code → real tokens.
   * No bearer needed — the user isn't authenticated yet at this point.
   */
  verify2fa: (dto: Verify2faDto) => http.post<TokensDto>("/auth/2fa/verify", dto),

  /** No refresh token involved — an ordinary bearer call, unlike its two siblings below. */
  revokeSession: (id: string) => http.delete<MessageDto>(`/auth/sessions/${id}`),
};

/**
 * `GET /auth/sessions` and `POST /auth/sessions/logout-all` both need the raw
 * refresh token, which never reaches client JS — so these two go through
 * dedicated server routes instead of the generic `/api/proxy` passthrough
 * every other endpoint uses. See `app/api/auth/sessions/*`.
 */
export const sessionsService = {
  list: async (): Promise<SessionDto[]> => {
    const res = await fetch("/api/auth/sessions", { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },

  logoutAllOthers: async (): Promise<LogoutAllResultDto> => {
    const res = await fetch("/api/auth/sessions/logout-all", { method: "POST" });
    if (!res.ok) return { revoked: 0 };
    return res.json();
  },
};

/** Server-side only — the browser never holds a refresh token. */
export type { RefreshDto };
