/*
  Warnings:

  - You are about to drop the column `images` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "images",
ADD COLUMN     "image" TEXT;
