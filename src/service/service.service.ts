import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { buildPagination } from 'utils/build-pagination.util';
import { fillDto } from 'utils/fill-dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FindServicesDto, ServiceSort } from './dto/find-services.dto';
import { ServiceRdo } from './rdo/service.rdo';
import { ServicesRdo } from './rdo/services.rdo';
import { FileService } from 'src/file/file.service';
import { ServiceUpdateInput } from 'generated/prisma/models';

@Injectable()
export class ServiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  private mapServiceToDto(s: any) {
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      icon: s.icon,
      description: s.description,
      fullDescription: s.fullDescription,
      features: s.features ?? [],
      image: s.image,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  private buildOrderBy(sort?: ServiceSort): any {
    switch (sort) {
      case 'newest':
        return { createdAt: 'desc' };
      case 'name':
      default:
        return { title: 'asc' };
    }
  }

  private buildWhere(query: FindServicesDto): any {
    const where: any = {};

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findAll(query: FindServicesDto): Promise<ServicesRdo> {
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort);

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy,
      }),
      this.prisma.service.count({ where }),
    ]);

    const mapped = services.map((s) => this.mapServiceToDto(s));

    return fillDto(ServicesRdo, {
      items: fillDto(ServiceRdo, mapped),
      pagination: buildPagination(total, query),
    });
  }

  async findOneBySlug(slug: string): Promise<ServiceRdo> {
    const service = await this.prisma.service.findUnique({
      where: { slug },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return fillDto(ServiceRdo, this.mapServiceToDto(service));
  }

  async create(
    dto: CreateServiceDto,
    file: Express.Multer.File,
  ): Promise<ServiceRdo> {
    const savedImage = await this.fileService.saveFile(file);

    const service = await this.prisma.service.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
        fullDescription: dto.fullDescription,
        features: dto.features ?? [],
        image: savedImage,
      },
    });

    return fillDto(ServiceRdo, this.mapServiceToDto(service));
  }

  async update(
    id: string,
    dto: UpdateServiceDto,
    file?: Express.Multer.File,
  ): Promise<ServiceRdo> {
    const existing = await this.prisma.service.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const data: ServiceUpdateInput = {};

    if (existing.image && file) {
      await this.fileService.deleteFile(existing.image);

      data.image = await this.fileService.saveFile(file);
    }

    if (dto.slug) data.slug = dto.slug;
    if (dto.title) data.title = dto.title;
    if (dto.description) data.description = dto.description;
    if (dto.fullDescription) data.fullDescription = dto.fullDescription;
    if (dto.features) data.features = dto.features;

    const service = await this.prisma.service.update({
      where: { id },
      data,
    });

    return fillDto(ServiceRdo, this.mapServiceToDto(service));
  }

  async delete(id: string): Promise<void> {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.image) {
      await this.fileService.deleteFile(service.image);
    }

    await this.prisma.service.delete({ where: { id } });
  }
}
