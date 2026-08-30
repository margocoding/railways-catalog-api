import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateServiceDto } from './dto/create-service.dto';
import { FindServicesDto } from './dto/find-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('service')
export class ServiceController {
  constructor(private readonly service: ServiceService) {}
  @Get()
  findAll(@Query() query: FindServicesDto) {
    return this.service.findAll(query);
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.service.findOneBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.create(dto, file);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }
}
