-- DropForeignKey
ALTER TABLE `Space` DROP FOREIGN KEY `Space_ownerId_id_fkey`;

-- DropIndex
DROP INDEX `Member_id_spaceOwnerId_key` ON `Member`;

-- AddForeignKey
ALTER TABLE `Space` ADD CONSTRAINT `Space_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
