import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Attributes = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Record<string, string> => {
    const request = ctx.switchToHttp().getRequest();
    const attributes: Record<string, string> = {};

    Object.entries(request.query).forEach(([key, value]) => {
      if (key.startsWith('attribute_') && typeof value === 'string') {
        attributes[key.replace('attribute_', '')] = value;
      }
    });

    return attributes;
  },
);