/*
  Warnings:

  - You are about to drop the column `publishedQuestionnaireId` on the `PublishedQuestion` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `PublishedQuestion_publishedQuestionnaireId_idx` ON `PublishedQuestion`;

-- DropIndex
DROP INDEX `PublishedQuestion_questionId_publishedQuestionnaireId_key` ON `PublishedQuestion`;

-- AlterTable
ALTER TABLE `PublishedQuestion` DROP COLUMN `publishedQuestionnaireId`;

-- CreateTable
CREATE TABLE `_PublishedQuestionToPublishedQuestionnaire` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PublishedQuestionToPublishedQuestionnaire_AB_unique`(`A`, `B`),
    INDEX `_PublishedQuestionToPublishedQuestionnaire_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
