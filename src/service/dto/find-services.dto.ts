import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from 'utils/dto/pagination.dto';

export const SERVICE_SORT_VALUES = ['name', 'newest'] as const;

export type ServiceSort = (typeof SERVICE_SORT_VALUES)[number];

export class FindServicesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @IsIn(SERVICE_SORT_VALUES)
  sort?: ServiceSort;
}
