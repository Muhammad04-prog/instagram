import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type {
  CreateLocationDto,
  DeletedDto,
  LocationDto,
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
  getLocations: (params: GetLocationsParams) => http.get<LocationDto[]>("/locations", params),

  getLocationById: (id: number) => http.get<LocationDto>(`/locations/${id}`),

  create: (dto: CreateLocationDto) => http.post<LocationDto>("/locations", dto),

  /** Full replacement, not a patch. */
  update: (id: number, dto: UpdateLocationDto) => http.put<LocationDto>(`/locations/${id}`, dto),

  remove: (id: number) => http.delete<DeletedDto>(`/locations/${id}`),
};
