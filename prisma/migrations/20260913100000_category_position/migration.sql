-- Порядок категорий в каталоге. Нумеруем с 1, существующие категории
-- получают текущий алфавитный порядок, чтобы после миграции ничего не переехало.
ALTER TABLE "Category" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

UPDATE "Category" AS c
SET "position" = numbered.row_number
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "name" ASC) AS row_number
  FROM "Category"
) AS numbered
WHERE c."id" = numbered."id";
