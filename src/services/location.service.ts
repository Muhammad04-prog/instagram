import { http } from "@/lib/axios";
import type {
  AddLocationDto,
  GetLocationsParams,
  Location,
  UpdateLocationDto,
} from "@/types/location.types";

/**
 * Swagger tag: Location (5 endpoints). Request DTOs come from Swagger; the
 * response shapes are from the live API (docs/API_REAL_DTO.md).
 */
export const locationService = {
  getLocations: (params: GetLocationsParams = {}) =>
    http.get<Location[]>("/Location/get-Locations", {
      City: params.city,
      State: params.state,
      ZipCode: params.zipCode,
      Country: params.country,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    }),

  /** A deleted id answers 200 with `data: null` — not 404. */
  getLocationById: (id: number) =>
    http.get<Location | null>("/Location/get-Location-by-id", { id }),

  /** Returns the created row. All four fields are required (empty → 400). */
  addLocation: (dto: AddLocationDto) => http.post<Location>("/Location/add-Location", dto),

  /**
   * 🔴 Broken server-side: every call answers 400 "Missing type map configuration"
   * (an AutoMapper misconfiguration — UpdateLocationDto → Location). Verified with
   * camelCase, PascalCase and query params. See docs/BACKEND_BUGS.md #19.
   */
  updateLocation: (dto: UpdateLocationDto) => http.put<Location>("/Location/update-Location", dto),

  deleteLocation: (id: number) => http.delete<boolean>("/Location/delete-Location", { id }),
};
