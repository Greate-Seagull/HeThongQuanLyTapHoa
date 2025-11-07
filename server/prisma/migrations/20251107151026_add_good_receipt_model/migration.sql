-- CreateTable
CREATE TABLE "GoodReceipt" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoodReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodReceiptDetail" (
    "goodReceiptId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "GoodReceiptDetail_pkey" PRIMARY KEY ("goodReceiptId","productId")
);

-- AddForeignKey
ALTER TABLE "GoodReceipt" ADD CONSTRAINT "GoodReceipt_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodReceiptDetail" ADD CONSTRAINT "GoodReceiptDetail_goodReceiptId_fkey" FOREIGN KEY ("goodReceiptId") REFERENCES "GoodReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodReceiptDetail" ADD CONSTRAINT "GoodReceiptDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
