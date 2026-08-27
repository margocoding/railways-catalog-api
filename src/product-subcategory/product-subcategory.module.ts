import { Module } from '@nestjs/common';
import { ProductSubcategoryController } from './product-subcategory.controller';
import { ProductSubcategoryService } from './product-subcategory.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductSubcategoryController],
  providers: [ProductSubcategoryService]
})
export class ProductSubcategoryModule {}
