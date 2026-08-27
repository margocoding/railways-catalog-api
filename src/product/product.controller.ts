import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'utils/dto/pagination.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('category') categorySlug?: string,
    @Query('subcategory') subcategorySlug?: string,
  ) {
    return this.service.findAll(pagination, categorySlug, subcategorySlug);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }
}