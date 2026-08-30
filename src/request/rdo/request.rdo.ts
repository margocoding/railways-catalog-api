import { Expose, Type } from 'class-transformer';
import { ServiceRdo } from 'src/service/rdo/service.rdo';
import { ProductRdo } from 'src/product/rdo/product.rdo';

export class RequestRdo {
  @Expose()
  id!: string;
  
  @Expose()
  name!: string;
  
  @Expose()
  phone!: string;
  
  @Expose()
  email?: string;
  
  @Expose()
  comment?: string;
  
  @Expose()
  policyAccepted!: boolean;
  
  @Expose()
  requestFilePath?: string;
  
  @Expose()
  partnerMapPath?: string;
  
  @Expose()
  serviceId?: string;
  
  @Expose()
  @Type(() => ServiceRdo)
  service?: ServiceRdo;
  
  @Expose()
  productId?: string;
  
  @Expose()
  @Type(() => ProductRdo)
  product?: ProductRdo;
  
  @Expose()
  createdAt!: Date;
  
  @Expose()
  updatedAt!: Date;
}