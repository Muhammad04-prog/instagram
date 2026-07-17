import type { AuthUserDto } from "@/types/api.types";

/**
 * Auth request/response DTOs now come straight from the generated Swagger types
 * (`api.types.ts`): RegisterDto, LoginDto, TokensDto, ResetPasswordDto,
 * ChangePasswordDto, VerifyCodeDto, … Only what Swagger does NOT describe lives
 * here: the JWT's internal claims and the identity we hand to the browser.
 */

/**
 * Claims we rely on from the decoded JWT. Server-side only.
 *
 * Only `exp` is contractual for us — it drives proactive refresh in the proxy.
 * The subject claim is read best-effort (`sub` in NestJS/passport-jwt), because
 * identity itself comes from `GET /auth/me`, not from parsing the token.
 */
export interface JwtPayload {
  sub: string;
  exp: number;
}

/**
 * The only identity data the browser ever receives — no token, ever.
 *
 * Sourced from `GET /auth/me` so it carries the fields the UI actually gates on
 * (`role` for the admin panel, `isVerified` for the blue tick, `isPrivate`).
 */
export type SessionUser = AuthUserDto;
