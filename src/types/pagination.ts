// Base filter type
export interface PaginationFilter<T> {
  key: keyof T;
  value: any;
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in" | "contains";
}

// Pagination controller interface
export interface PaginationController<T> {
  // Data
  data: T[];
  totalItems: number;
  loading: boolean;

  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Sorting
  sortKey?: keyof T | null;
  sortDirection?: "asc" | "desc" | null;
  setSort?: (key: keyof T | null, direction: "asc" | "desc" | null) => void;

  // Filtering
  filters?: PaginationFilter<T>[];
  setFilters?: (filters: PaginationFilter<T>[]) => void;

  // Search
  search?: string;
  setSearch?: (search: string) => void;
}
