/*
  Warnings:

  - You are about to alter the column `password` on the `Questionnaire` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(60)`.

*/
-- AlterTable
ALTER TABLE `Questionnaire` MODIFY `password` CHAR(60) NULL;
