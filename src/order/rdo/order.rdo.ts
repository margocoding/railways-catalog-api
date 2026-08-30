import { Expose, Type } from 'class-transformer';
import { OrderItemRdo } from './order-item.rdo';

export class OrderRdo {
  @Expose()
  id!: string;
  
  @Expose()
  orderNumber!: string;
  
  @Expose()
  name!: string;
  
  @Expose()
  phone!: string;
  
  @Expose()
  email?: string;
  
  @Expose()
  address?: string;
  
  @Expose()
  comment?: string;
  
  @Expose()
  policyAccepted!: boolean;
  
  @Expose()
  status!: string;
  
  @Expose()
  totalAmount!: number;
  
  @Expose()
  @Type(() => OrderItemRdo)
  items!: OrderItemRdo[];
  
  @Expose()
  createdAt!: Date;
  
  @Expose()
  updatedAt!: Date;
}