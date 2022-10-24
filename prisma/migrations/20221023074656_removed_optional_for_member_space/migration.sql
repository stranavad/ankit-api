/*
  Warnings:

  - Made the column `spaceId` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_spaceId_fkey`;

-- AlterTable
ALTER TABLE `Member` MODIFY `spaceId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `Space`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
