import { http } from "@/lib/axios";
import type { CursorParams, Page } from "@/lib/cursor";
import type {
  CreateLocationDto,
  DeletedDto,
  LocationDto,
  PostDto,
  UpdateLocationDto,
} from "@/types/api.types";

export interface GetLocationsParams extends CursorParams {
  /** Free-text search across the location fields. */
  q?: string;
}

/**
 * Swagger tag: locations (5 endpoints).
 *
 * `PUT /locations/{id}` works here — softclub's update answered 400 with an
 * AutoMapper "Missing type map configuration" on every call (bug #19). Deleting
 * a location no longer strands posts either: their `locationId` becomes null.
 */
export const locationService = {
  getLocations: (params: GetLocationsParams) => http.get<Page<LocationDto>>("/locations", params),

  getLocationById: (id: number) => http.get<LocationDto>(`/locations/${id}`),

  /**
   * New — the "no feed" gap `LocationScreen` used to document is closed.
   * Same `PostsService.explore` backing as `/search/hashtag/{name}`: closed
   * accounts and blocks excluded, own posts never included.
   */
  getLocationPosts: (id: number, params: CursorParams) =>
    http.get<Page<PostDto>>(`/locations/${id}/posts`, params),

  create: (dto: CreateLocationDto) => http.post<LocationDto>("/locations", dto),

  /** Full replacement, not a patch. */
  update: (id: number, dto: UpdateLocationDto) => http.put<LocationDto>(`/locations/${id}`, dto),

  remove: (id: number) => http.delete<DeletedDto>(`/locations/${id}`),
};
