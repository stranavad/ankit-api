/*
  Warnings:

  - A unique constraint covering the columns `[id,spaceOwnerId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,id]` on the table `Space` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Space` DROP FOREIGN KEY `Space_ownerId_fkey`;

-- AlterTable
ALTER TABLE `Member` ADD COLUMN `spaceOwnerId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Member_id_spaceOwnerId_key` ON `Member`(`id`, `spaceOwnerId`);

-- CreateIndex
CREATE UNIQUE INDEX `Space_ownerId_id_key` ON `Space`(`ownerId`, `id`);

-- AddForeignKey
ALTER TABLE `Space` ADD CONSTRAINT `Space_ownerId_id_fkey` FOREIGN KEY (`ownerId`, `id`) REFERENCES `Member`(`id`, `spaceOwnerId`) ON DELETE RESTRICT ON UPDATE CASCADE;
