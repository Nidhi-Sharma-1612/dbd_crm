-- DropIndex
DROP INDEX "contacts_email_trgm_idx";

-- DropIndex
DROP INDEX "contacts_name_trgm_idx";

-- DropIndex
DROP INDEX "contacts_phone_trgm_idx";

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "callbackDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "contacts_callbackDate_idx" ON "contacts"("callbackDate");
