-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MORNING', 'DAY', 'EVENING');

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "shift" "Shift";
