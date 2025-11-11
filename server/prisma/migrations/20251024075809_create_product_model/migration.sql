-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);
