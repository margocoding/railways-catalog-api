import { PaginationDto } from 'utils/dto/pagination.dto';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function buildPagination(
  total: number,
  pagination: PaginationDto,
): PaginationMeta {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}