-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'ACCOUNTANT';
ALTER TYPE "UserRole" ADD VALUE 'EMPLOYEE';
ALTER TYPE "UserRole" ADD VALUE 'EXAM_CONTROLLER';
ALTER TYPE "UserRole" ADD VALUE 'LIBRARIAN';
ALTER TYPE "UserRole" ADD VALUE 'SECURITY';
ALTER TYPE "UserRole" ADD VALUE 'CLEANER';
ALTER TYPE "UserRole" ADD VALUE 'DRIVER';

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "idNo" TEXT,
    "hfId" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloodGroup" TEXT,
    "gender" "Gender",
    "religion" TEXT,
    "medium" "Medium",
    "department" TEXT,
    "shift" "Shift",
    "nid" TEXT,
    "birthCertNo" TEXT,
    "email" TEXT,
    "serialNo" TEXT,
    "presentAddress" TEXT,
    "permanentAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_educations" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "exam" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "gpa" TEXT,
    "grade" TEXT,
    "passingYear" TEXT,
    "board" TEXT,
    "duration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_experiences" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "address" TEXT,
    "duration" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_userId_key" ON "staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employeeId_key" ON "staff"("employeeId");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_educations" ADD CONSTRAINT "staff_educations_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_experiences" ADD CONSTRAINT "staff_experiences_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
