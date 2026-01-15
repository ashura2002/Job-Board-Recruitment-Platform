export type PaginatedResult<T> = {
  data: T[];
  metaData: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
