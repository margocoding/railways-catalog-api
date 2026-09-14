import { Transform } from 'class-transformer';

/**
 * Согласие с политикой приходит строкой: заявка — multipart-формой, где любое поле
 * текстовое, а заказ может прислать "false" и в JSON. С enableImplicitConversion
 * ValidationPipe превращал строку через Boolean(), и "false" становилось true —
 * заявка без согласия проходила проверку @Equals(true). Согласием считаем только
 * true или "true", всё прочее — отказом.
 */
export const PolicyAcceptedTransform = () =>
  Transform(({ obj, key }) => {
    const raw = obj[key];
    return raw === true || raw === 'true';
  });
