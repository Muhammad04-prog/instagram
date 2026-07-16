/**
 * The DTOs themselves live in `api.types.ts`, generated from the backend's
 * Swagger — import them from there. What remains here is the hand-written layer:
 * the response envelope, auth/session shapes, and per-domain helpers.
 *
 * `user.types`, `location.types` and `story.types` are gone: they described
 * softclub's shapes, and each is now covered by a generated DTO.
 */
export * from "./api.types";
export * from "./response.types";
export * from "./auth.types";
export * from "./post.types";
export * from "./chat.types";
export * from "./profile.types";
