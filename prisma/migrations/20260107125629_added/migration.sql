-- CreateEnum
CREATE TYPE "scheduleType" AS ENUM ('FullTime', 'PartTime', 'Contract', 'Remote');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "schedule" "scheduleType" NOT NULL DEFAULT 'FullTime';
