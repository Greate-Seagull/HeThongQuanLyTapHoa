/*
  Warnings:

  - Added the required column `unit` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "product_unit" AS ENUM ('UNKNOWN');

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "name" TEXT,
ADD COLUMN     "unit" "product_unit" NOT NULL;
