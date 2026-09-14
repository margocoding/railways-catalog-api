const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.DOTENV_CONFIG_QUIET = 'true';
require('reflect-metadata');
const { parseJsonFormField, parseJsonFormArrayOf } = require('../dist/src/common/json-form-field');
const { CreateProductSpecDto } = require('../dist/src/product/dto/create-product.dto');

test('JSON form field: string is parsed, other values and broken JSON pass through', () => {
  assert.deepEqual(parseJsonFormField('["a","b"]'), ['a', 'b']);
  assert.deepEqual(parseJsonFormField(['a']), ['a']);
  assert.equal(parseJsonFormField('не json'), 'не json');
  assert.equal(parseJsonFormField(undefined), undefined);
});

test('JSON form array: items from a string become DTO instances, non-strings are untouched', () => {
  const parsed = parseJsonFormArrayOf(CreateProductSpecDto, '[{"label":"Масса","value":"7.66"}]');
  assert.equal(parsed.length, 1);
  assert.ok(parsed[0] instanceof CreateProductSpecDto);
  assert.equal(parsed[0].label, 'Масса');

  const raw = [{ label: 'Масса' }];
  assert.equal(parseJsonFormArrayOf(CreateProductSpecDto, raw), raw);
  assert.deepEqual(parseJsonFormArrayOf(CreateProductSpecDto, '{"x":1}'), { x: 1 });
  assert.equal(parseJsonFormArrayOf(CreateProductSpecDto, '[oops'), '[oops');
});
