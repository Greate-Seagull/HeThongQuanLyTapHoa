-- DropForeignKey
ALTER TABLE "public"."InvoiceDetail" DROP CONSTRAINT "InvoiceDetail_invoiceId_fkey";

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
