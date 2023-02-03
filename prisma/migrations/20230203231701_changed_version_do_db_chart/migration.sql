/*
  Warnings:

  - You are about to alter the column `version` on the `PublishedQuestionnaire` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(20)`.

*/
-- AlterTable
ALTER TABLE `PublishedQuestionnaire` MODIFY `version` CHAR(20) NOT NULL DEFAULT 'v0.0.1';
