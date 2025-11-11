/*
  Warnings:

  - Added the required column `position` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmployeePosition" AS ENUM ('SALES', 'INVENTORY', 'RECEIVING');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "position" "EmployeePosition" NOT NULL;

-- CreateTable
CREATE TABLE "EmployeeAccount" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeAccount" ADD CONSTRAINT "EmployeeAccount_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
