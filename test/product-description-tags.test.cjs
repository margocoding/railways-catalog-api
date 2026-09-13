const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.DOTENV_CONFIG_QUIET = 'true';
const { ValidationPipe } = require('@nestjs/common');
const { ProductService } = require('../dist/src/product/product.service');
const { CreateProductDto } = require('../dist/src/product/dto/create-product.dto');
const { UpdateProductDto } = require('../dist/src/product/dto/update-product.dto');

function setup() {
  const state = {
    id: 'p', sku: 'SKU', slug: 'bolt', title: 'Болт', price: null,
    condition: 'NEW', stock: 1, categoryId: 'cat',
    category: { id: 'cat', slug: 'rails', name: 'Рельсы' },
    images: ['/uploads/bolt.png'], specs: [], analogues: [],
    description: 'Описание на странице', descriptionTags: 'Описание для поиска',
    updatedAt: new Date('2026-09-12T00:00:00Z'),
  };
  const prisma = {
    category: { async findUnique() { return state.category; } },
    product: {
      async findUnique() { return structuredClone(state); },
      async create({ data }) {
        Object.assign(state, data, { specs: data.specs.create });
        return structuredClone(state);
      },
      async update({ data }) {
        Object.assign(state, data);
        return structuredClone(state);
      },
    },
  };
  const files = { async deleteFiles() {} };
  return { service: new ProductService(prisma, files), state };
}

test('multipart product DTOs accept search descriptions and explicit clearing', async () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, transformOptions: { enableImplicitConversion: true } });
  const base = { sku: 'SKU', title: 'Болт', slug: 'bolt', stock: '1', condition: 'new', categorySlug: 'rails' };
  const created = await pipe.transform({ ...base, descriptionTags: 'Текст для поиска' }, { type: 'body', metatype: CreateProductDto });
  assert.equal(created.descriptionTags, 'Текст для поиска');
  for (const value of ['', null, 'Новое описание']) {
    const updated = await pipe.transform({ descriptionTags: value }, { type: 'body', metatype: UpdateProductDto });
    assert.equal(updated.descriptionTags, value);
  }
  await assert.rejects(pipe.transform({ descriptionTags: ['bad'] }, { type: 'body', metatype: UpdateProductDto }), error => error.getStatus() === 400);
});

test('creation returns the stored search description separately from visible content', async () => {
  const { service, state } = setup();
  const result = await service.create({
    sku: 'SKU', title: 'Болт', slug: 'bolt', stock: 1, condition: 'new',
    categorySlug: 'rails', description: 'Описание на странице',
    descriptionTags: '  Поисковое описание  ',
  });
  assert.equal(state.descriptionTags, 'Поисковое описание');
  assert.equal(result.descriptionTags, 'Поисковое описание');
  assert.equal(result.description, 'Описание на странице');
});

test('partial edits preserve search descriptions; empty text clears only that field', async () => {
  const { service, state } = setup();
  assert.equal((await service.update('p', { title: 'Другой заголовок' })).descriptionTags, 'Описание для поиска');
  assert.equal((await service.update('p', { descriptionTags: '  Новый текст  ' })).descriptionTags, 'Новый текст');
  assert.equal((await service.update('p', { descriptionTags: ' \n ' })).descriptionTags, null);
  assert.equal(state.description, 'Описание на странице');
  assert.deepEqual(state.images, ['/uploads/bolt.png']);
});

test('products created without search text keep an empty optional field', async () => {
  for (const descriptionTags of [undefined, '', '  ']) {
    const { service } = setup();
    const result = await service.create({ sku: 'SKU', title: 'Болт', slug: 'bolt', stock: 1, condition: 'new', categorySlug: 'rails', descriptionTags });
    assert.equal(result.descriptionTags, null);
  }
});
