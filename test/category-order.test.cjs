const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.DOTENV_CONFIG_QUIET = 'true';
const {
  ProductCategoryService,
} = require('../dist/src/product-category/product-category.service');

function setup() {
  const categories = [
    { id: 'rails', name: 'Железнодорожные рельсы', slug: 'rails', description: '', image: '/rails.png', position: 1 },
    { id: 'sleepers', name: 'Шпалы и Брус', slug: 'sleepers', description: '', image: '/sleepers.png', position: 2 },
    { id: 'fasteners', name: 'ЖД крепеж', slug: 'fasteners', description: '', image: '/fasteners.png', position: 3 },
  ];

  const prisma = {
    category: {
      async findMany({ orderBy } = {}) {
        const list = structuredClone(categories);
        if (orderBy) {
          list.sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
        }
        return list;
      },
      async count() {
        return categories.length;
      },
      async aggregate() {
        return { _max: { position: Math.max(...categories.map((c) => c.position)) } };
      },
      async update({ where, data }) {
        const found = categories.find((c) => c.id === where.id);
        Object.assign(found, data);
        return structuredClone(found);
      },
      async create({ data }) {
        const created = { ...data, id: 'new', filters: [], subcategories: [] };
        categories.push(created);
        return structuredClone(created);
      },
    },
    async $transaction(operations) {
      return Promise.all(operations);
    },
  };

  const files = {
    async saveFile() {
      return '/uploads/new.png';
    },
    async deleteFile() {},
  };

  return { service: new ProductCategoryService(prisma, files), categories };
}

test('reorder puts categories in the given order and returns the new list', async () => {
  const { service, categories } = setup();

  const result = await service.reorder(['fasteners', 'rails', 'sleepers']);

  assert.deepEqual(
    categories.map((c) => [c.id, c.position]).sort((a, b) => a[1] - b[1]),
    [['fasteners', 1], ['rails', 2], ['sleepers', 3]],
  );
  assert.deepEqual(result.items.map((c) => c.id), ['fasteners', 'rails', 'sleepers']);
  assert.deepEqual(result.items.map((c) => c.position), [1, 2, 3]);
});

test('reorder refuses a partial list, duplicates and unknown ids, changing nothing', async () => {
  const { service, categories } = setup();
  const before = categories.map((c) => [c.id, c.position]);

  await assert.rejects(() => service.reorder(['rails', 'sleepers']), /Expected all 3 categories/);
  await assert.rejects(() => service.reorder(['rails', 'rails', 'sleepers']), /must be unique/);
  await assert.rejects(() => service.reorder(['rails', 'sleepers', 'ghost']), /Category not found: ghost/);

  assert.deepEqual(categories.map((c) => [c.id, c.position]), before);
});

test('a new category lands at the end of the list, not in the middle by name', async () => {
  const { service } = setup();

  const created = await service.create(
    { name: 'Абразивы', slug: 'abrasives', description: 'Зачистка', filters: [] },
    { buffer: Buffer.from('') },
  );

  assert.equal(created.position, 4);
});
