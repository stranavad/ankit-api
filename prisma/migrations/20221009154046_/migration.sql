/*
  Warnings:

  - A unique constraint covering the columns `[accountId,spaceId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Member_accountId_spaceId_key` ON `Member`(`accountId`, `spaceId`);
