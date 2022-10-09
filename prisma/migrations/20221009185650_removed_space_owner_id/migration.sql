/*
  Warnings:

  - You are about to drop the column `spaceOwnerId` on the `Member` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Member_spaceOwnerId_key` ON `Member`;

-- AlterTable
ALTER TABLE `Member` DROP COLUMN `spaceOwnerId`;
