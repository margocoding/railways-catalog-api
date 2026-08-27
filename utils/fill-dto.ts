import { plainToInstance, ClassConstructor } from 'class-transformer';

export function fillDto<T, V>(
  DtoClass: ClassConstructor<T>,
  data: V,
): T {
  return plainToInstance(DtoClass, data, {
    excludeExtraneousValues: true,
    exposeDefaultValues: true,
  });
}