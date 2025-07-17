-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "customName" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "startDate" TIMESTAMP(3);
