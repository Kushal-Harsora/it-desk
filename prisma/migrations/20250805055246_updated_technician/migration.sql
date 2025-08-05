/*
  Warnings:

  - Added the required column `password` to the `Technician` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `technician` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `password` VARCHAR(191) NOT NULL;
