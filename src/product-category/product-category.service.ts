import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'utils/dto/pagination.dto';
import { buildPagination } from 'utils/build-pagination.util';
import { fillDto } from 'utils/fill-dto';
import { mapFilterOptionToPrisma } from 'utils/mappers/filter-option.mapper';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRdo } from './rdo/category.rdo';
import { CategoriesRdo } from './rdo/categories.rdo';

@Injectable()
export class ProductCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private mapCategoryToDto(c: any) {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      filters:
        c.filters?.map((f: any) => ({
          key: f.key,
          label: f.label,
          type: f.type?.toLowerCase() as 'select' | 'range',
          options: f.options as any,
        })) ?? [],
    };
  }

  async findAll(pagination: PaginationDto): Promise<CategoriesRdo> {
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        include: { filters: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count(),
    ]);

    const mapped = categories.map((c) => this.mapCategoryToDto(c));

    return fillDto(CategoriesRdo, {
      items: fillDto(CategoryRdo, mapped),
      pagination: buildPagination(total, pagination),
    });
  }

  async findOne(id: string): Promise<CategoryRdo> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { filters: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return fillDto(CategoryRdo, this.mapCategoryToDto(category));
  }

  async create(dto: CreateCategoryDto): Promise<CategoryRdo> {
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        image: dto.image,
        filters: {
          create: dto.filters?.map(mapFilterOptionToPrisma) ?? [],
        },
      },
      include: { filters: true },
    });

    return fillDto(CategoryRdo, this.mapCategoryToDto(category));
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryRdo> {
    const existing = await this.prisma.category.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const data: any = { ...dto };

    if (dto.filters) {
      await this.prisma.filterOption.deleteMany({
        where: { categoryId: id },
      });

      data.filters = {
        create: dto.filters.map(mapFilterOptionToPrisma),
      };
    }

    const category = await this.prisma.category.update({
      where: { id },
      data,
      include: { filters: true },
    });

    return fillDto(CategoryRdo, this.mapCategoryToDto(category));
  }

  async delete(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.delete({ where: { id } });
  }
}