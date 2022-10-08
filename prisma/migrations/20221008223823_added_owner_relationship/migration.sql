/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Space` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Member` ADD COLUMN `spaceOwnerId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Space` ADD COLUMN `ownerId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Space_ownerId_key` ON `Space`(`ownerId`);

-- AddForeignKey
ALTER TABLE `Space` ADD CONSTRAINT `Space_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
