// src/product/product.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { buildPagination } from 'utils/build-pagination.util';
import { fillDto } from 'utils/fill-dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto, ProductSort } from './dto/find-products.dto';
import { ProductRdo } from './rdo/product.rdo';
import { ProductsRdo } from './rdo/products.rdo';
import { FileService } from 'src/file/file.service';
import { ProductUpdateInput } from 'generated/prisma/models';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  private mapProductToDto(p: any, options: { includeSimilar?: boolean } = {}) {
    const base: any = {
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
      descriptionTags: p.descriptionTags,
      analogues: p.analogues,
      categorySlug: p.category?.slug,
      subcategorySlug: p.subcategory?.slug ?? undefined,
      category: p.category,
      subcategory: p.subcategory,
      specs:
        p.specs?.map((s: any) => ({
          id: s.id,
          value:
            !isNaN(Number(s.value)) && s.value !== ''
              ? Number(s.value)
              : s.value,
          unit: s.unit,
          label: s.label,
        })) ?? [],
    };

    if (p.category) {
      base.category = {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
        description: p.category.description,
        image: p.category.image,
        filters:
          p.category.filters?.map((f: any) => ({
            key: f.key,
            label: f.label,
            type: f.type?.toLowerCase() as 'select' | 'range',
            options: f.options as any,
          })) ?? [],
      };
    }

    if (p.subcategory) {
      base.subcategory = {
        id: p.subcategory.id,
        name: p.subcategory.name,
        slug: p.subcategory.slug,
        categoryId: p.subcategory.categoryId,
        categorySlug: p.category?.slug,
        filters:
          p.subcategory.filters?.map((f: any) => ({
            key: f.key,
            label: f.label,
            type: f.type?.toLowerCase() as 'select' | 'range',
            options: f.options as any,
          })) ?? [],
      };
    }

    if (options.includeSimilar && p.similarProducts) {
      base.similarProducts = p.similarProducts.map((sp: any) => ({
        id: sp.id,
        sku: sp.sku,
        title: sp.title,
        slug: sp.slug,
        gost: sp.gost,
        price: sp.price,
        priceOnRequest: sp.priceOnRequest,
        stock: sp.stock,
        condition: sp.condition.toLowerCase(),
        images: sp.images,
        description: sp.description,
        analogues: sp.analogues,
        categorySlug: sp.category?.slug,
        subcategorySlug: sp.subcategory?.slug ?? undefined,
        specs:
          sp.specs?.map((s: any) => ({
            id: s.specId,
            value:
              !isNaN(Number(s.value)) && s.value !== ''
                ? Number(s.value)
                : s.value,
            unit: s.unit,
            label: s.label,
          })) ?? [],
      }));
    }

    return base;
  }

  private buildOrderBy(sort?: ProductSort): any {
    switch (sort) {
      case 'price-asc':
        return { price: 'asc' };
      case 'price-desc':
        return { price: 'desc' };
      case 'popular':
        return { stock: 'desc' };
      case 'newest':
        return { createdAt: 'desc' };
      case 'name':
      default:
        return { title: 'asc' };
    }
  }

  private buildWhere(
    query: FindProductsDto,
    attributes: Record<string, string>,
  ): any {
    const where: any = {};

    if (
      query.priceMin !== undefined &&
      query.priceMax !== undefined &&
      query.priceMin > query.priceMax
    ) {
      throw new BadRequestException(
        'Minimum price must not exceed maximum price',
      );
    }

    if (query.gost?.trim()) {
      where.gost = { contains: query.gost.trim(), mode: 'insensitive' };
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      where.price = {
        ...(query.priceMin !== undefined ? { gte: query.priceMin } : {}),
        ...(query.priceMax !== undefined ? { lte: query.priceMax } : {}),
      };
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }

    if (query.subcategorySlug) {
      where.subcategory = { slug: query.subcategorySlug };
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { gost: { contains: search, mode: 'insensitive' } },
        { descriptionTags: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (query.condition) {
      where.condition = query.condition.toUpperCase();
    }

    if (query.stock === 'in-stock') {
      where.stock = { gt: 0 };
    }

    if (query.stock === 'on-order') {
      where.stock = { lte: 0 };
    }

    const attributeEntries = Object.entries(attributes).filter(
      ([, value]) => value && value !== 'all',
    );

    if (attributeEntries.length > 0) {
      where.AND = attributeEntries.map(([key, value]) => ({
        specs: {
          some: {
            id: key,
            value: String(value),
          },
        },
      }));
    }

    return where;
  }

  async findAll(
    query: FindProductsDto,
    attributes: Record<string, string> = {},
  ): Promise<ProductsRdo> {
    const where = this.buildWhere(query, attributes);
    const orderBy = this.buildOrderBy(query.sort);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, subcategory: true, specs: true },
        skip: query.skip,
        take: query.take,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const mapped = products.map((p) => this.mapProductToDto(p));

    return fillDto(ProductsRdo, {
      items: fillDto(ProductRdo, mapped),
      pagination: buildPagination(total, query),
    });
  }

  async findOneBySlug(slug: string): Promise<ProductRdo> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: { include: { filters: true } },
        subcategory: { include: { filters: true } },
        specs: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const similarProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        id: { not: product.id },
      },
      include: {
        category: true,
        subcategory: true,
        specs: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    const mapped = this.mapProductToDto(
      { ...product, similarProducts },
      { includeSimilar: true },
    );

    return fillDto(ProductRdo, mapped);
  }

  async create(
    dto: CreateProductDto,
    files: Express.Multer.File[] = [],
  ): Promise<ProductRdo> {
    if (dto.stock < 0) {
      throw new BadRequestException(
        'Количество на складе не может быть отрицательным',
      );
    }

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

    const savedImages = await this.saveImages(files);
    try {
      const product = await this.prisma.product.create({
        data: {
          sku: dto.sku,
          title: dto.title,
          slug: dto.slug,
          gost: dto.gost,
          price: dto.price ?? null,
          stock: dto.stock,
          condition: dto.condition.toUpperCase() as any,
          images: savedImages,
          description: dto.description,
          descriptionTags: dto.descriptionTags?.trim() || null,
          analogues: dto.analogues,
          categoryId: category.id,
          subcategoryId,
          specs: {
            create:
              dto.specs?.map((s) => ({
                value: String(s.value),
                unit: s.unit,
                label: s.label,
              })) ?? [],
          },
        },
        include: { category: true, subcategory: true, specs: true },
      });

      return fillDto(ProductRdo, this.mapProductToDto(product));
    } catch (error) {
      await this.fileService.deleteFiles(savedImages);
      throw error;
    }
  }

  private async saveImages(files: Express.Multer.File[]): Promise<string[]> {
    const saved: string[] = [];
    try {
      for (const file of files)
        saved.push(await this.fileService.saveFile(file));
      return saved;
    } catch (error) {
      await this.fileService.deleteFiles(saved);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    files: Express.Multer.File[] = [],
  ): Promise<ProductRdo> {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (dto.stock !== undefined && dto.stock < 0) {
      throw new BadRequestException(
        'Количество на складе не может быть отрицательным',
      );
    }

    const data: ProductUpdateInput = {};

    const retainedImages = dto.retainedImages ?? existing.images;
    if (retainedImages.some((image) => !existing.images.includes(image))) {
      throw new BadRequestException('Изображение не принадлежит этому товару');
    }
    if (
      new Set(retainedImages).size !== retainedImages.length ||
      retainedImages.length + files.length > 10
    ) {
      throw new BadRequestException(
        'У товара может быть не более 10 различных изображений',
      );
    }

    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.gost !== undefined) data.gost = dto.gost;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.descriptionTags !== undefined) {
      data.descriptionTags = dto.descriptionTags?.trim() || null;
    }
    if (dto.analogues !== undefined) data.analogues = dto.analogues;

    if (dto.condition) {
      data.condition = dto.condition.toUpperCase() as any;
    }

    let categoryId = existing.categoryId;
    if (dto.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: dto.categorySlug },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      data.category = { connect: { id: category.id } };
      categoryId = category.id;
    }

    if (dto.subcategorySlug !== undefined) {
      if (!dto.subcategorySlug) {
        data.subcategory = { disconnect: true };
      } else if (dto.subcategorySlug) {
        const subcategory = await this.prisma.subcategory.findFirst({
          where: { slug: dto.subcategorySlug, categoryId },
        });

        if (!subcategory) {
          throw new NotFoundException('Subcategory not found');
        }

        data.subcategory = { connect: { id: subcategory.id } };
      }
    } else if (categoryId !== existing.categoryId) {
      data.subcategory = { disconnect: true };
    }

    if (dto.specs !== undefined) {
      data.specs = {
        deleteMany: {},
        create: dto.specs.map((s) => ({
          value: String(s.value),
          unit: s.unit,
          label: s.label,
        })),
      };
    }

    const savedImages = await this.saveImages(files);
    if (dto.retainedImages !== undefined || savedImages.length) {
      data.images = [...retainedImages, ...savedImages];
    }
    let product;
    try {
      product = await this.prisma.product.update({
        where: {
          id,
          updatedAt: existing.updatedAt,
          images: { equals: existing.images },
        },
        data,
        include: { category: true, subcategory: true, specs: true },
      });
    } catch (error) {
      await this.fileService.deleteFiles(savedImages);
      if (error?.code === 'P2025') {
        throw new ConflictException(
          'Товар уже изменён. Обновите страницу и повторите сохранение.',
        );
      }
      throw error;
    }
    await this.fileService.deleteFiles(
      existing.images.filter((image) => !retainedImages.includes(image)),
    );

    return fillDto(ProductRdo, this.mapProductToDto(product));
  }

  async delete(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({ where: { id } });
    await this.fileService.deleteFiles(product.images);
  }
}
