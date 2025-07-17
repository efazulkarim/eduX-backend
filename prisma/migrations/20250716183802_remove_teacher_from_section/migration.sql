/*
  Warnings:

  - You are about to drop the column `teacherId` on the `sections` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "sections" DROP CONSTRAINT "sections_teacherId_fkey";

-- AlterTable
ALTER TABLE "sections" DROP COLUMN "teacherId";
