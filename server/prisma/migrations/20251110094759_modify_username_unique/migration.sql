/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `EmployeeAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAccount_username_key" ON "EmployeeAccount"("username");
