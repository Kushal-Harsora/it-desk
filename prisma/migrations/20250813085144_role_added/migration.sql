-- AlterTable
ALTER TABLE `admin` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'Admin';

-- AlterTable
ALTER TABLE `superadmin` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'Superadmin';

-- AlterTable
ALTER TABLE `technician` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'Technician';
