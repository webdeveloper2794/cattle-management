-- CreateEnum
CREATE TYPE "CattleStatus" AS ENUM ('Active', 'Sold', 'Deceased', 'Transferred');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('Healthy', 'Sick', 'Recovering', 'NeedsCheckup');

-- CreateEnum
CREATE TYPE "Purpose" AS ENUM ('Breeding', 'Dairy', 'Meat');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateTable
CREATE TABLE "Cattle" (
    "id" TEXT NOT NULL,
    "identificationNumber" TEXT NOT NULL,
    "name" TEXT,
    "breed" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "purpose" "Purpose" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "currentStatus" "CattleStatus" NOT NULL DEFAULT 'Active',
    "healthStatus" "HealthStatus" NOT NULL DEFAULT 'Healthy',
    "notes" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cattle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightRecord" (
    "id" TEXT NOT NULL,
    "cattleId" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WeightRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cattle_identificationNumber_key" ON "Cattle"("identificationNumber");

-- CreateIndex
CREATE INDEX "Cattle_breed_idx" ON "Cattle"("breed");

-- CreateIndex
CREATE INDEX "Cattle_gender_idx" ON "Cattle"("gender");

-- CreateIndex
CREATE INDEX "Cattle_purpose_idx" ON "Cattle"("purpose");

-- CreateIndex
CREATE INDEX "Cattle_currentStatus_idx" ON "Cattle"("currentStatus");

-- CreateIndex
CREATE INDEX "Cattle_healthStatus_idx" ON "Cattle"("healthStatus");

-- CreateIndex
CREATE INDEX "Cattle_dateOfBirth_idx" ON "Cattle"("dateOfBirth");

-- CreateIndex
CREATE INDEX "WeightRecord_cattleId_measuredAt_idx" ON "WeightRecord"("cattleId", "measuredAt");

-- AddForeignKey
ALTER TABLE "WeightRecord" ADD CONSTRAINT "WeightRecord_cattleId_fkey" FOREIGN KEY ("cattleId") REFERENCES "Cattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
