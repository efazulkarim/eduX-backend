/*
  Warnings:

  - You are about to drop the column `parentName` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "parentName",
ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "medium" "Medium",
ADD COLUMN     "motherName" TEXT,
ALTER COLUMN "rollNumber" DROP NOT NULL,
ALTER COLUMN "admissionNo" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "parentPhone" DROP NOT NULL;
