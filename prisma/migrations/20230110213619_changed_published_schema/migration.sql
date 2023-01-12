/*
  Warnings:

  - You are about to drop the column `data` on the `PublishedQuestionnaire` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PublishedQuestionnaire` DROP COLUMN `data`;

-- CreateTable
CREATE TABLE `PublishedOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `deleted` BOOLEAN NOT NULL,

    INDEX `PublishedOption_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PublishedQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `visible` BOOLEAN NOT NULL,
    `required` BOOLEAN NOT NULL,
    `deleted` BOOLEAN NOT NULL,
    `position` DOUBLE NOT NULL,
    `type` ENUM('TEXT', 'SELECT', 'MULTI_SELECT') NOT NULL,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `questionnaireId` INTEGER NOT NULL,
    `publishedQuestionnaireId` INTEGER NOT NULL,

    INDEX `PublishedQuestion_publishedQuestionnaireId_idx`(`publishedQuestionnaireId`),
    INDEX `PublishedQuestion_questionId_idx`(`questionId`),
    INDEX `PublishedQuestion_questionnaireId_idx`(`questionnaireId`),
    UNIQUE INDEX `PublishedQuestion_questionId_publishedQuestionnaireId_key`(`questionId`, `publishedQuestionnaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
