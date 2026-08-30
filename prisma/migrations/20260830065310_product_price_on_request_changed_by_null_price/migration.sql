/*
  Warnings:

  - You are about to drop the column `priceOnRequest` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "priceOnRequest",
ALTER COLUMN "price" DROP NOT NULL;
