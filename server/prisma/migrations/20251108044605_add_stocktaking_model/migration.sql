-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('GOOD', 'EXPIRED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'GOOD';

-- CreateTable
CREATE TABLE "Shelf" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Shelf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rack" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shelfId" INTEGER NOT NULL,

    CONSTRAINT "Rack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rackId" INTEGER NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotDetail" (
    "slotId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "SlotDetail_pkey" PRIMARY KEY ("slotId","productId")
);

-- CreateTable
CREATE TABLE "Stocktaking" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stocktaking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StocktakingDetail" (
    "id" SERIAL NOT NULL,
    "stocktakingId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "slotId" INTEGER NOT NULL,
    "status" "ProductStatus" NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "StocktakingDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rack" ADD CONSTRAINT "Rack_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotDetail" ADD CONSTRAINT "SlotDetail_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotDetail" ADD CONSTRAINT "SlotDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stocktaking" ADD CONSTRAINT "Stocktaking_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StocktakingDetail" ADD CONSTRAINT "StocktakingDetail_stocktakingId_fkey" FOREIGN KEY ("stocktakingId") REFERENCES "Stocktaking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StocktakingDetail" ADD CONSTRAINT "StocktakingDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StocktakingDetail" ADD CONSTRAINT "StocktakingDetail_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
