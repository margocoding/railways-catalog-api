const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.DOTENV_CONFIG_QUIET = 'true';
const { ValidationPipe } = require('@nestjs/common');
const { CreateRequestDto } = require('../dist/src/request/dto/create-request.dto');
const { CreateOrderDto } = require('../dist/src/order/dto/create-order.dto');

// Те же настройки, что в src/main.ts.
const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
});

const POLICY_ERROR = 'Необходимо согласие с политикой конфиденциальности';

async function messages(metatype, body) {
  try {
    const dto = await pipe.transform(body, { type: 'body', metatype });
    return { dto, errors: [] };
  } catch (error) {
    return { dto: null, errors: [].concat(error.getResponse().message) };
  }
}

const request = (policyAccepted) => ({ name: 'Иван', phone: '+7 (843) 259-73-00', policyAccepted });
const order = (policyAccepted) => ({ ...request(policyAccepted), items: '[{"productId":"p1","quantity":1}]' });

for (const [name, metatype, body] of [['request', CreateRequestDto, request], ['order', CreateOrderDto, order]]) {
  test(`${name}: consent refused as a form string is rejected`, async () => {
    for (const refused of ['false', false, '', '0', 'off', 'no', undefined]) {
      const { errors } = await messages(metatype, body(refused));
      assert.ok(errors.includes(POLICY_ERROR), `${JSON.stringify(refused)} must not count as consent`);
    }
  });

  test(`${name}: consent given as boolean or form string is accepted`, async () => {
    for (const accepted of [true, 'true']) {
      const { dto, errors } = await messages(metatype, body(accepted));
      assert.deepEqual(errors, []);
      assert.equal(dto.policyAccepted, true);
    }
  });
}
