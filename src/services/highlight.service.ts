import { http } from "@/lib/axios";
import type {
  CreateHighlightDto,
  DeletedDto,
  HighlightDto,
  HighlightWithStoriesDto,
  UpdateHighlightDto,
} from "@/types/api.types";

/**
 * Swagger tag: highlights (5 endpoints).
 *
 * "Актуальное" — the circles under a profile's bio. Built from stories that
 * already exist (including expired ones), which is why the picker reads the
 * archive: deleting a highlight leaves its stories alone.
 *
 * ⚠️ Highlight ids are **strings** (uuid), unlike story/post ids which are numbers.
 */
export const highlightService = {
  create: (dto: CreateHighlightDto) => http.post<HighlightDto>("/highlights", dto),

  getUserHighlights: (userId: string) => http.get<HighlightDto[]>(`/highlights/user/${userId}`),

  /** The only place the stories themselves come back. */
  getHighlight: (id: string) => http.get<HighlightWithStoriesDto>(`/highlights/${id}`),

  update: (id: string, dto: UpdateHighlightDto) => http.put<HighlightDto>(`/highlights/${id}`, dto),

  /** Removes the highlight; the stories inside it survive. */
  remove: (id: string) => http.delete<DeletedDto>(`/highlights/${id}`),
};
