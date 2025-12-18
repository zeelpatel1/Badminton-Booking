/*
  Warnings:

  - You are about to drop the column `day` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `specialties` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CoachBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourtBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipmentBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pricePerHour` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePrice` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PricingRuleType" AS ENUM ('PEAK_HOUR', 'WEEKEND', 'INDOOR', 'EQUIPMENT', 'COACH');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "CoachBooking" DROP CONSTRAINT "CoachBooking_availabilityId_fkey";

-- DropForeignKey
ALTER TABLE "CoachBooking" DROP CONSTRAINT "CoachBooking_coachId_fkey";

-- DropForeignKey
ALTER TABLE "CoachBooking" DROP CONSTRAINT "CoachBooking_userId_fkey";

-- DropForeignKey
ALTER TABLE "CourtBooking" DROP CONSTRAINT "CourtBooking_courtId_fkey";

-- DropForeignKey
ALTER TABLE "CourtBooking" DROP CONSTRAINT "CourtBooking_userId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentBooking" DROP CONSTRAINT "EquipmentBooking_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentBooking" DROP CONSTRAINT "EquipmentBooking_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "day";

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "specialties",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pricePerHour" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "basePrice" INTEGER NOT NULL,
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "phone" DROP NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "CoachBooking";

-- DropTable
DROP TABLE "CourtBooking";

-- DropTable
DROP TABLE "EquipmentBooking";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "WeekDay";

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtReservation" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "courtId" INTEGER NOT NULL,

    CONSTRAINT "CourtReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentReservation" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "EquipmentReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachReservation" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "availabilityId" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL,

    CONSTRAINT "CoachReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PricingRuleType" NOT NULL,
    "value" INTEGER NOT NULL,
    "isPercent" BOOLEAN NOT NULL,
    "priority" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courtId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourtReservation_bookingId_key" ON "CourtReservation"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachReservation_bookingId_key" ON "CoachReservation"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachReservation_availabilityId_key" ON "CoachReservation"("availabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtReservation" ADD CONSTRAINT "CourtReservation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtReservation" ADD CONSTRAINT "CourtReservation_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentReservation" ADD CONSTRAINT "EquipmentReservation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentReservation" ADD CONSTRAINT "EquipmentReservation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachReservation" ADD CONSTRAINT "CoachReservation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachReservation" ADD CONSTRAINT "CoachReservation_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachReservation" ADD CONSTRAINT "CoachReservation_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
