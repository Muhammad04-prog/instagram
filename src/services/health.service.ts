import { http } from "@/lib/axios";
import type { HealthDto } from "@/types/api.types";

/**
 * Swagger tag: health (1 endpoint).
 *
 * The only endpoint that answers without a token, and the only one that says
 * *why* the API is unhappy: `status: degraded` with database/redis/storage each
 * up or down.
 *
 * It is asked exactly once, and only after something else has already failed —
 * to tell "your connection is out" apart from "our services are down". Polling
 * it on a healthy app would be noise.
 */
export const healthService = {
  check: () => http.get<HealthDto>("/health"),
};
