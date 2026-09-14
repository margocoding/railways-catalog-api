import { plainToInstance, type ClassConstructor } from 'class-transformer';

/**
 * Массивы и объекты в multipart-форме приходят JSON-строкой. Строку разбираем; значение другого
 * типа и невалидный JSON отдаём как есть — дальше их отклонят валидаторы DTO.
 */
export function parseJsonFormField(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

/**
 * То же для массива вложенных DTO: элементы разобранного из строки массива превращаются в
 * экземпляры класса, чтобы сработала вложенная валидация.
 */
export function parseJsonFormArrayOf<T>(
  cls: ClassConstructor<T>,
  value: unknown,
): unknown {
  if (typeof value !== 'string') return value;
  const parsed = parseJsonFormField(value);
  return Array.isArray(parsed)
    ? parsed.map((item) => plainToInstance(cls, item as object))
    : parsed;
}
