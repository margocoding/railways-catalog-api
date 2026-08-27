import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { ProductCategoryModule } from './product-category/product-category.module';
import { ProductSubcategoryModule } from './product-subcategory/product-subcategory.module';

@Module({
  imports: [ProductModule, ProductCategoryModule, ProductSubcategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
