/** Shape read off the live API (Swagger declares no response schema). */
export interface Location {
  /** The API calls it `locationId`, not `id`. */
  locationId: number;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface GetLocationsParams {
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  pageNumber?: number;
  pageSize?: number;
}

export type AddLocationDto = Omit<Location, "locationId">;

export interface UpdateLocationDto extends AddLocationDto {
  locationId: number;
}
