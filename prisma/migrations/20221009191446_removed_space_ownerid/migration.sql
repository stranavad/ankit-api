/*
  Warnings:

  - You are about to drop the column `spaceOwnerId` on the `Member` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Space_ownerId_id_key` ON `Space`;

-- AlterTable
ALTER TABLE `Member` DROP COLUMN `spaceOwnerId`;
