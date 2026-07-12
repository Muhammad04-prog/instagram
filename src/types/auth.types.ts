/** Swagger: Domain.Dtos.RegisterDto — all five fields required, no birthday. */
export interface RegisterDto {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  userName: string;
  password: string;
}

/** POST /Account/login → JWT string. */
export type LoginResponse = string;

export interface ResetPasswordDto {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

/** Claims we rely on from the decoded JWT. Server-side only. */
export interface JwtPayload {
  sid: string;
  name: string;
  email: string;
  role?: string | string[];
  exp: number;
}

/** The only identity data the browser ever receives — no token. */
export interface SessionUser {
  userId: string;
  userName: string;
  email: string;
}
