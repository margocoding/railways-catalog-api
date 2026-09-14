import { InputJsonValue } from 'generated/prisma/internal/prismaNamespace';
import { FilterOptionDto } from 'utils/dto/filter-option.dto';
import type { FilterOption } from 'generated/prisma/client';

export function mapFilterOptionToPrisma(f: FilterOptionDto) {
  return {
    key: f.key,
    label: f.label,
    type: f.type?.toUpperCase() as any,
    options: f.options
      ? (f.options.map((o) => ({
          value: o.value,
          label: o.label,
        })) as InputJsonValue)
      : undefined,
  };
}

/** Фильтр из базы — в вид для ответа API (тип строчными буквами, как ждёт сайт). */
export function mapFilterOptionToRdo(f: FilterOption) {
  return {
    key: f.key,
    label: f.label,
    type: f.type.toLowerCase() as 'select' | 'range',
    options: f.options,
  };
}
