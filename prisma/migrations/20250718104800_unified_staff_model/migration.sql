/*
  Warnings:

  - You are about to drop the column `teacherId` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the `teachers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `staffId` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffId` to the `exams` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('TEACHER', 'ADMIN_STAFF', 'ACCOUNTANT', 'EXAM_CONTROLLER', 'LIBRARIAN', 'SECURITY', 'CLEANER', 'DRIVER', 'OTHER');

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_userId_fkey";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "teacherId",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "teacherId",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "address" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "role" "StaffRole" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "salary" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "teacherId",
ADD COLUMN     "staffId" TEXT;

-- DropTable
DROP TABLE "teachers";

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
