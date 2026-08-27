
import { InputJsonValue } from 'generated/prisma/internal/prismaNamespace';
import { FilterOptionDto } from 'utils/dto/filter-option.dto';

export function mapFilterOptionToPrisma(f: FilterOptionDto) {
  return {
    key: f.key,
    label: f.label,
    type: f.type?.toUpperCase() as any,
    options: f.options
      ? (f.options.map((o) => ({ value: o.value, label: o.label })) as InputJsonValue)
      : undefined,
  };
}