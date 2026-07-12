export interface Location {
  id: number;
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

export type AddLocationDto = Omit<Location, "id">;

export interface UpdateLocationDto extends AddLocationDto {
  locationId: number;
}
