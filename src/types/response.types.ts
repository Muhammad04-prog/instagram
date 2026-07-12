/** Every backend response is wrapped: { data, errors, statusCode }. */
export interface ApiResponse<T> {
  data: T;
  errors: string[] | null;
  statusCode: number;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}
