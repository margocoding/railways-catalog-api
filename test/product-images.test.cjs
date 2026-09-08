const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.DOTENV_CONFIG_QUIET = 'true';
const { ProductService } = require('../dist/src/product/product.service');
const { ValidationPipe } = require('@nestjs/common');
const { UpdateProductDto } = require('../dist/src/product/dto/update-product.dto');

function setup(options = {}) {
  const state = { id: 'p', sku: 'SKU', slug: 'product', title: 'Товар', price: null, condition: 'NEW', stock: 1, categoryId: 'cat', category: { slug: 'rails', name: 'Рельсы' }, images: ['/uploads/old.png'], specs: [{ label: 'Размер', value: '2' }], updatedAt: new Date('2026-01-01') };
  const events = [];
  const files = {
    async saveFile(file) { events.push(['save', file.originalname]); if (file.fail) throw new Error('disk full'); return `/uploads/${file.originalname}`; },
    async deleteFiles(paths) { if (paths.length) events.push(['delete', paths]); },
  };
  const prisma = {
    category: { async findUnique() { return { id: 'cat' }; } },
    product: {
      async findUnique() { return structuredClone(state); },
      async update({ data, where }) {
        assert.equal(where.updatedAt.getTime(), state.updatedAt.getTime());
        events.push(['update']);
        if (options.error) throw options.error;
        if (data.images) state.images = data.images;
        if (data.specs) { assert.deepEqual(data.specs.deleteMany, {}); state.specs = data.specs.create; }
        if (data.price !== undefined) state.price = data.price;
        state.updatedAt = new Date(state.updatedAt.getTime() + 1);
        return state;
      },
      async create() { throw new Error('duplicate SKU'); },
    },
  };
  return { service: new ProductService(prisma, files), state, events };
}

test('successive image uploads append and preserve existing files', async () => {
  const { service, state, events } = setup();
  await service.update('p', {}, [{ originalname: 'second.png' }]);
  await service.update('p', {}, [{ originalname: 'third.png' }]);
  assert.deepEqual(state.images, ['/uploads/old.png', '/uploads/second.png', '/uploads/third.png']);
  assert.ok(!events.some(([event]) => event === 'delete'));
});
test('explicit removal deletes only omitted images after the database update', async () => {
  const { service, state, events } = setup();
  await service.update('p', { retainedImages: [] }, [{ originalname: 'replacement.png' }]);
  assert.deepEqual(state.images, ['/uploads/replacement.png']);
  assert.deepEqual(events, [['save', 'replacement.png'], ['update'], ['delete', ['/uploads/old.png']]]);
});
test('text-only edits preserve images and an empty specs array removes specs atomically', async () => {
  const { service, state, events } = setup();
  await service.update('p', { specs: [] });
  assert.deepEqual(state.images, ['/uploads/old.png']);
  assert.deepEqual(state.specs, []);
  assert.deepEqual(events, [['update']]);
});
test('failed update preserves old images and specs, and removes only new uploads', async () => {
  const { service, state, events } = setup({ error: new Error('duplicate SKU') });
  await assert.rejects(service.update('p', { retainedImages: [], specs: [] }, [{ originalname: 'new.png' }]), /duplicate SKU/);
  assert.deepEqual(state.images, ['/uploads/old.png']);
  assert.equal(state.specs.length, 1);
  assert.deepEqual(events.at(-1), ['delete', ['/uploads/new.png']]);
});
test('partial disk failure cleans saved uploads and does not touch the database', async () => {
  const { service, events } = setup();
  await assert.rejects(service.update('p', {}, [{ originalname: 'one.png' }, { originalname: 'two.png', fail: true }]), /disk full/);
  assert.deepEqual(events.at(-1), ['delete', ['/uploads/one.png']]);
  assert.ok(!events.some(([event]) => event === 'update'));
});
test('foreign or duplicate image paths are rejected before saving any files', async () => {
  for (const retainedImages of [['/uploads/foreign.png'], ['/uploads/old.png', '/uploads/old.png']]) {
    const { service, events } = setup();
    await assert.rejects(service.update('p', { retainedImages }, [{ originalname: 'new.png' }]), error => error.getStatus() === 400);
    assert.deepEqual(events, []);
  }
});
test('the image limit counts both old and new images', async () => {
  const { service, state, events } = setup();
  state.images = Array.from({ length: 10 }, (_, index) => `/uploads/${index}.png`);
  await assert.rejects(service.update('p', {}, [{ originalname: 'new.png' }]), error => error.getStatus() === 400);
  assert.deepEqual(events, []);
});
test('concurrent edits return a conflict instead of overwriting a newer update', async () => {
  const { service, state, events } = setup({ error: { code: 'P2025' } });
  await assert.rejects(service.update('p', {}, [{ originalname: 'new.png' }]), error => error.getStatus() === 409);
  assert.deepEqual(state.images, ['/uploads/old.png']);
  assert.deepEqual(events.at(-1), ['delete', ['/uploads/new.png']]);
});
test('failed creation cleans uploaded files', async () => {
  const { service, events } = setup();
  await assert.rejects(service.create({ categorySlug: 'rails', stock: 1, condition: 'new' }, [{ originalname: 'new.png' }]), /duplicate SKU/);
  assert.deepEqual(events.at(-1), ['delete', ['/uploads/new.png']]);
});
test('multipart DTO supports null price, zero price, empty image arrays and validates JSON', async () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, transformOptions: { enableImplicitConversion: true } });
  const options = { type: 'body', metatype: UpdateProductDto };
  const dto = await pipe.transform({ price: 'null', retainedImages: '[]', specs: '[]' }, options);
  assert.equal(dto.price, null);
  assert.deepEqual(dto.retainedImages, []);
  assert.equal((await pipe.transform({ price: '0' }, options)).price, 0);
  await assert.rejects(pipe.transform({ retainedImages: 'not json' }, options), error => error.getStatus() === 400);
  await assert.rejects(pipe.transform({ retainedImages: '["a","a"]' }, options), error => error.getStatus() === 400);
});
