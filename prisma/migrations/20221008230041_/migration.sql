/*
  Warnings:

  - A unique constraint covering the columns `[spaceOwnerId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Member_spaceOwnerId_key` ON `Member`(`spaceOwnerId`);
