-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
