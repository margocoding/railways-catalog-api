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
import { FileService } from 'src/file/file.service';

@Injectable()
export class ProductCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

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
      subcategories:
        c.subcategories?.map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          categoryId: s.categoryId,
          categorySlug: c.slug,
          filters:
            s.filters?.map((f: any) => ({
              key: f.key,
              label: f.label,
              type: f.type?.toLowerCase() as 'select' | 'range',
              options: f.options as any,
            })) ?? [],
        })) ?? [],
    };
  }

  async findAll(pagination: PaginationDto): Promise<CategoriesRdo> {
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        include: {
          filters: true,
          subcategories: {
            include: { filters: true },
            orderBy: { name: 'asc' },
          },
        },
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
      include: {
        filters: true,
        subcategories: {
          include: { filters: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return fillDto(CategoryRdo, this.mapCategoryToDto(category));
  }

  async create(
    dto: CreateCategoryDto,
    file: Express.Multer.File,
  ): Promise<CategoryRdo> {
    let imagePath: string = await this.fileService.saveFile(file);

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        image: imagePath,
        filters: {
          create: dto.filters?.map(mapFilterOptionToPrisma) ?? [],
        },
      },
      include: {
        filters: true,
        subcategories: {
          include: { filters: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    return fillDto(CategoryRdo, this.mapCategoryToDto(category));
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<CategoryRdo> {
    const existing = await this.prisma.category.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const data: any = { ...dto };

    if (file) {
      await this.fileService.deleteFile(existing.image);
      data.image = await this.fileService.saveFile(file);
    }

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
      include: {
        filters: true,
        subcategories: {
          include: { filters: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    return fillDto(CategoryRdo, this.mapCategoryToDto(category));
  }

  async delete(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { filters: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.fileService.deleteFile(category.image);

    await this.prisma.category.delete({ where: { id } });
  }
}