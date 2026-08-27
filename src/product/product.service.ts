import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'utils/dto/pagination.dto';
import { buildPagination } from 'utils/build-pagination.util';
import { fillDto } from 'utils/fill-dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRdo } from './rdo/product.rdo';
import { ProductsRdo } from './rdo/products.rdo';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private mapProductToDto(p: any) {
    return {
      id: p.id,
      sku: p.sku,
      title: p.title,
      slug: p.slug,
      gost: p.gost,
      price: p.price,
      priceOnRequest: p.priceOnRequest,
      stock: p.stock,
      condition: p.condition.toLowerCase(),
      images: p.images,
      description: p.description,
      analogues: p.analogues,
      categorySlug: p.category?.slug,
      subcategorySlug: p.subcategory?.slug ?? undefined,
      specs:
        p.specs?.map((s: any) => ({
          id: s.specId,
          value:
            !isNaN(Number(s.value)) && s.value !== ''
              ? Number(s.value)
              : s.value,
          unit: s.unit,
          label: s.label,
        })) ?? [],
    };
  }

  async findAll(
    pagination: PaginationDto,
    categorySlug?: string,
    subcategorySlug?: string,
  ): Promise<ProductsRdo> {
    const where: any = {};

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (subcategorySlug) {
      where.subcategory = { slug: subcategorySlug };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, subcategory: true, specs: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const mapped = products.map((p) => this.mapProductToDto(p));

    return fillDto(ProductsRdo, {
      items: fillDto(ProductRdo, mapped),
      pagination: buildPagination(total, pagination),
    });
  }

  async create(dto: CreateProductDto): Promise<ProductRdo> {
    const category = await this.prisma.category.findUnique({
      where: { slug: dto.categorySlug },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let subcategoryId: string | null = null;

    if (dto.subcategorySlug) {
      const subcategory = await this.prisma.subcategory.findFirst({
        where: { slug: dto.subcategorySlug, categoryId: category.id },
      });

      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }

      subcategoryId = subcategory.id;
    }

    const product = await this.prisma.product.create({
      data: {
        sku: dto.sku,
        title: dto.title,
        slug: dto.slug,
        gost: dto.gost,
        price: dto.price,
        priceOnRequest: dto.priceOnRequest,
        stock: dto.stock,
        condition: dto.condition.toUpperCase() as any,
        images: dto.images,
        description: dto.description,
        analogues: dto.analogues,
        categoryId: category.id,
        subcategoryId,
        specs: {
          create:
            dto.specs?.map((s) => ({
              specId: s.id,
              value: String(s.value),
              unit: s.unit,
              label: s.label,
            })) ?? [],
        },
      },
      include: { category: true, subcategory: true, specs: true },
    });

    return fillDto(ProductRdo, this.mapProductToDto(product));
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductRdo> {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const data: any = { ...dto };

    if (dto.condition) {
      data.condition = dto.condition.toUpperCase();
    }

    if (dto.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: dto.categorySlug },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      data.category = { connect: { id: category.id } };
    }

    if (dto.subcategorySlug !== undefined) {
      if (dto.subcategorySlug === null) {
        data.subcategory = { disconnect: true };
      } else {
        const subcategory = await this.prisma.subcategory.findFirst({
          where: { slug: dto.subcategorySlug },
        });

        if (!subcategory) {
          throw new NotFoundException('Subcategory not found');
        }

        data.subcategory = { connect: { id: subcategory.id } };
      }
    }

    if (dto.specs) {
      await this.prisma.productSpec.deleteMany({ where: { productId: id } });

      data.specs = {
        create: dto.specs.map((s) => ({
          specId: s.id,
          value: String(s.value),
          unit: s.unit,
          label: s.label,
        })),
      };
    }

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, subcategory: true, specs: true },
    });

    return fillDto(ProductRdo, this.mapProductToDto(product));
  }

  async delete(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({ where: { id } });
  }
}