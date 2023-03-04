/*
  Warnings:

  - You are about to drop the column `design` on the `Questionnaire` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Questionnaire` DROP COLUMN `design`;

-- CreateTable
CREATE TABLE `QuestionnaireDesign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionnaireId` INTEGER NOT NULL,
    `font` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `logoPlacement` VARCHAR(191) NULL,
    `backgroundColor` VARCHAR(191) NULL,
    `backgroundImage` VARCHAR(191) NULL,
    `buttonColor` VARCHAR(191) NULL,
    `buttonTextColor` VARCHAR(191) NULL,
    `textColor` VARCHAR(191) NULL,
    `optionSelectedColor` VARCHAR(191) NULL,

    UNIQUE INDEX `QuestionnaireDesign_questionnaireId_key`(`questionnaireId`),
    INDEX `QuestionnaireDesign_questionnaireId_idx`(`questionnaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
