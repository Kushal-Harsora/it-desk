-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `companyId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `companyId` VARCHAR(191) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subdomain` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Company_name_key`(`name`),
    UNIQUE INDEX `Company_subdomain_key`(`subdomain`),
    UNIQUE INDEX `Company_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
