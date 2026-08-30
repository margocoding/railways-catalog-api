import { Expose } from 'class-transformer';

export class OrderItemRdo {
  @Expose()
  id!: string;
  
  @Expose()
  quantity!: number;
  
  @Expose()
  price!: number;
  
  @Expose()
  productTitle!: string;
  
  @Expose()
  productSku!: string;
  
  @Expose()
  productSlug!: string;
  
  @Expose()
  productImage?: string;
  
  @Expose()
  productId!: string;
  
  @Expose()
  createdAt!: Date;
  
  @Expose()
  updatedAt!: Date;
}