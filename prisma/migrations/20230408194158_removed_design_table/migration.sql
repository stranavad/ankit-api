/*
  Warnings:

  - You are about to drop the `QuestionnaireDesign` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Questionnaire` ADD COLUMN `backgroundColor` VARCHAR(191) NULL,
    ADD COLUMN `backgroundImage` VARCHAR(191) NULL,
    ADD COLUMN `buttonColor` VARCHAR(191) NULL,
    ADD COLUMN `buttonText` VARCHAR(191) NULL,
    ADD COLUMN `font` VARCHAR(191) NULL,
    ADD COLUMN `logoPlacement` VARCHAR(191) NULL,
    ADD COLUMN `logoUrl` VARCHAR(191) NULL,
    ADD COLUMN `optionColor` VARCHAR(191) NULL,
    ADD COLUMN `optionSelectedColor` VARCHAR(191) NULL,
    ADD COLUMN `optionSelectedText` VARCHAR(191) NULL,
    ADD COLUMN `optionText` VARCHAR(191) NULL,
    ADD COLUMN `textColor` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `QuestionnaireDesign`;
