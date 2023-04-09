/*
  Warnings:

  - You are about to drop the column `buttonTextColor` on the `QuestionnaireDesign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `QuestionnaireDesign` DROP COLUMN `buttonTextColor`,
    ADD COLUMN `buttonText` VARCHAR(191) NULL,
    ADD COLUMN `optionSelectedText` VARCHAR(191) NULL,
    ADD COLUMN `optionText` VARCHAR(191) NULL;
