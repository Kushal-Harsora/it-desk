/*
  Warnings:

  - You are about to drop the column `authorId` on the `comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_authorId_fkey`;

-- DropIndex
DROP INDEX `Comment_authorId_fkey` ON `comment`;

-- AlterTable
ALTER TABLE `comment` DROP COLUMN `authorId`,
    ADD COLUMN `authorTechId` INTEGER NULL,
    ADD COLUMN `authorUserId` INTEGER NULL;

-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `userId` INTEGER NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_authorTechId_fkey` FOREIGN KEY (`authorTechId`) REFERENCES `Technician`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
