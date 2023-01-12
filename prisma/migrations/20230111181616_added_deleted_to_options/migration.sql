/*
  Warnings:

  - Added the required column `optionId` to the `PublishedOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Option` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PublishedOption` ADD COLUMN `optionId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `PublishedOption_optionId_idx` ON `PublishedOption`(`optionId`);
