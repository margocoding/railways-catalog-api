import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'utils/dto/pagination.dto';
import { buildPagination } from 'utils/build-pagination.util';
import { fillDto } from 'utils/fill-dto';
import { mapFilterOptionToPrisma } from 'utils/mappers/filter-option.mapper';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { SubcategoryRdo } from './rdo/subcategory.rdo';
import { SubcategoriesRdo } from './rdo/subcategories.rdo';

@Injectable()
export class ProductSubcategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private mapSubcategoryToDto(s: any) {
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      categoryId: s.categoryId,
      categorySlug: s.category?.slug,
      filters:
        s.filters?.map((f: any) => ({
          key: f.key,
          label: f.label,
          type: f.type?.toLowerCase() as 'select' | 'range',
          options: f.options as any,
        })) ?? [],
    };
  }

  async findAll(pagination: PaginationDto): Promise<SubcategoriesRdo> {
    const [subcategories, total] = await Promise.all([
      this.prisma.subcategory.findMany({
        include: { category: true, filters: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.subcategory.count(),
    ]);

    const mapped = subcategories.map((s) => this.mapSubcategoryToDto(s));

    return fillDto(SubcategoriesRdo, {
      items: fillDto(SubcategoryRdo, mapped),
      pagination: buildPagination(total, pagination),
    });
  }

  async findOne(id: string): Promise<SubcategoryRdo> {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: { category: true, filters: true },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    return fillDto(SubcategoryRdo, this.mapSubcategoryToDto(subcategory));
  }

  async create(dto: CreateSubcategoryDto): Promise<SubcategoryRdo> {
    const category = await this.prisma.category.findUnique({
      where: { slug: dto.categorySlug },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const subcategory = await this.prisma.subcategory.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        categoryId: category.id,
        filters: {
          create: dto.filters?.map(mapFilterOptionToPrisma) ?? [],
        },
      },
      include: { category: true, filters: true },
    });

    return fillDto(SubcategoryRdo, this.mapSubcategoryToDto(subcategory));
  }

  async update(
    id: string,
    dto: UpdateSubcategoryDto,
  ): Promise<SubcategoryRdo> {
    const existing = await this.prisma.subcategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Subcategory not found');
    }

    const data: any = { ...dto };

    if (dto.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: dto.categorySlug },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      data.category = { connect: { id: category.id } };
    }

    if (dto.filters) {
      await this.prisma.filterOption.deleteMany({
        where: { subcategoryId: id },
      });

      data.filters = {
        create: dto.filters.map(mapFilterOptionToPrisma),
      };
    }

    const subcategory = await this.prisma.subcategory.update({
      where: { id },
      data,
      include: { category: true, filters: true },
    });

    return fillDto(SubcategoryRdo, this.mapSubcategoryToDto(subcategory));
  }

  async delete(id: string): Promise<void> {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    await this.prisma.subcategory.delete({ where: { id } });
  }
}