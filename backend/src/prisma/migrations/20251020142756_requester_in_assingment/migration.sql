-- AlterTable
ALTER TABLE "public"."Assignment" ADD COLUMN     "requesterId" TEXT NOT NULL DEFAULT 'cmfzxhs2n001ohklgjuipl4nu';

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
