import { http } from "@/lib/axios";
import type { VerificationStatusDto } from "@/types/api.types";

/**
 * Swagger tag: verification (4 endpoints).
 *
 * Meta Verified: a 7-day trial (once per account) or a $1000/mo subscription.
 * The payment is a **mock** on the backend — nothing real is charged — but the
 * blue tick it grants is real: `isVerified` flows into every user DTO.
 *
 * Cancelling keeps the tick until the paid period ends, so `status` and
 * `isVerified` disagree on purpose in that window.
 */
export const verificationService = {
  getStatus: () => http.get<VerificationStatusDto>("/verification/status"),

  /** Once per account — `trialUsed` says whether it is still on the table. */
  startTrial: () => http.post<VerificationStatusDto>("/verification/start-trial"),

  subscribe: () => http.post<VerificationStatusDto>("/verification/subscribe"),

  cancel: () => http.post<VerificationStatusDto>("/verification/cancel"),
};
