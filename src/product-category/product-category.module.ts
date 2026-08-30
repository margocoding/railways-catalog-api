import { Module } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { ProductCategoryController } from './product-category.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [PrismaModule, FileModule],
  providers: [ProductCategoryService],
  controllers: [ProductCategoryController]
})
export class ProductCategoryModule {}
