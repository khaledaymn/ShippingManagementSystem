export interface PaginationResponse<T> {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  data: ReadonlyArray<T>;
}
