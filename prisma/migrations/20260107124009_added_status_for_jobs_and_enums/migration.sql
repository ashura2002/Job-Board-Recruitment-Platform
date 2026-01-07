-- CreateEnum
CREATE TYPE "JobAvailability" AS ENUM ('Active', 'Closed');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "status" "JobAvailability" NOT NULL DEFAULT 'Active';
