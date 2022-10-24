/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Space` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_spaceId_fkey`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Space` DROP FOREIGN KEY `Space_ownerId_fkey`;

-- AlterTable
ALTER TABLE `Space` DROP COLUMN `ownerId`;
