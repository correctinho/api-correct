-- DropForeignKey
ALTER TABLE "user_info" DROP CONSTRAINT "user_info_address_uuid_fkey";

-- DropForeignKey
ALTER TABLE "user_info" DROP CONSTRAINT "user_info_user_document_validation_uuid_fkey";

-- AlterTable
ALTER TABLE "user_info" ALTER COLUMN "address_uuid" DROP NOT NULL,
ALTER COLUMN "user_document_validation_uuid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_info" ADD CONSTRAINT "user_info_address_uuid_fkey" FOREIGN KEY ("address_uuid") REFERENCES "addresses"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_info" ADD CONSTRAINT "user_info_user_document_validation_uuid_fkey" FOREIGN KEY ("user_document_validation_uuid") REFERENCES "user_document_validation"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
