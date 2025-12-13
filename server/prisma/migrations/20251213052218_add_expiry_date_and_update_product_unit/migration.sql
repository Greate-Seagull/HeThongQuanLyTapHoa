/*
  Warnings:

  - The values [UNKNOWN] on the enum `ProductUnit` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductUnit_new" AS ENUM ('PIECE', 'BOX', 'BOTTLE', 'CAN', 'PACKAGE', 'BAG', 'KG', 'GRAM', 'LITER', 'ML');
ALTER TABLE "public"."Product" ALTER COLUMN "unit" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "unit" TYPE "ProductUnit_new" USING ("unit"::text::"ProductUnit_new");
ALTER TYPE "ProductUnit" RENAME TO "ProductUnit_old";
ALTER TYPE "ProductUnit_new" RENAME TO "ProductUnit";
DROP TYPE "public"."ProductUnit_old";
ALTER TABLE "Product" ALTER COLUMN "unit" SET DEFAULT 'PIECE';
COMMIT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ALTER COLUMN "unit" SET DEFAULT 'PIECE';
