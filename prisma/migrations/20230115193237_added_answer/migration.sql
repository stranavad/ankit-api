-- CreateTable
CREATE TABLE `QuestionAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `questionnaireId` INTEGER NOT NULL,
    `questionnaireAnswerId` INTEGER NOT NULL,
    `answeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `value` VARCHAR(191) NULL,

    INDEX `QuestionAnswer_questionId_idx`(`questionId`),
    INDEX `QuestionAnswer_questionnaireId_idx`(`questionnaireId`),
    INDEX `QuestionAnswer_questionnaireAnswerId_idx`(`questionnaireAnswerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionnaireAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionnaireId` INTEGER NOT NULL,
    `publishedQuestionnaireId` INTEGER NULL,
    `answeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `QuestionnaireAnswer_questionnaireId_idx`(`questionnaireId`),
    INDEX `QuestionnaireAnswer_publishedQuestionnaireId_idx`(`publishedQuestionnaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OptionToQuestionAnswer` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OptionToQuestionAnswer_AB_unique`(`A`, `B`),
    INDEX `_OptionToQuestionAnswer_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
