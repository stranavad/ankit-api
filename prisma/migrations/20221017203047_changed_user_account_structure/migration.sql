/*
  Warnings:

  - You are about to drop the column `accountId` on the `Member` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,spaceId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_accountId_fkey`;

-- DropIndex
DROP INDEX `Member_accountId_spaceId_key` ON `Member`;

-- AlterTable
ALTER TABLE `Member` DROP COLUMN `accountId`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Member_userId_spaceId_key` ON `Member`(`userId`, `spaceId`);

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
