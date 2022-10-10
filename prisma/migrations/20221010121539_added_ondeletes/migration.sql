-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_spaceId_fkey`;

-- DropForeignKey
ALTER TABLE `Space` DROP FOREIGN KEY `Space_ownerId_fkey`;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `Space`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Space` ADD CONSTRAINT `Space_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
