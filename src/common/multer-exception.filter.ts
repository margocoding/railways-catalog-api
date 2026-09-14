import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { Response } from 'express';
import { MulterError } from 'multer';

/**
 * Nest превращает ошибки multer в HTTP-ответы, сравнивая текст сообщения, а multer 2.3+ поменял
 * текст LIMIT_UNEXPECTED_FILE («Unexpected field» → «Unexpected file field») и добавил новые коды.
 * Неузнанная ошибка уходила клиенту как 500. Сопоставляем по коду: превышен размер — 413,
 * остальные ошибки разбора формы — 400, как было до обновления multer.
 */
export function multerErrorToHttpException(error: MulterError): HttpException {
  const message = error.field
    ? `${error.message} - ${error.field}`
    : error.message;
  return error.code === 'LIMIT_FILE_SIZE'
    ? new PayloadTooLargeException(error.message)
    : new BadRequestException(message);
}

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(error: MulterError, host: ArgumentsHost) {
    const exception = multerErrorToHttpException(error);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(exception.getStatus())
      .json(exception.getResponse());
  }
}
