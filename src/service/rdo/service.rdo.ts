import { Expose } from 'class-transformer';

export class ServiceRdo {
  @Expose()
  id!: string;

  @Expose()
  slug!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  fullDescription?: string;

  @Expose()
  features!: string[];

  @Expose()
  image?: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
