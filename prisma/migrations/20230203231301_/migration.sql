-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `id_token` TEXT NULL,

    INDEX `Account_userId_fkey`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `accepted` BOOLEAN NOT NULL DEFAULT false,
    `spaceId` INTEGER NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NOT NULL,

    INDEX `Member_spaceId_fkey`(`spaceId`),
    INDEX `Member_userId_idx`(`userId`),
    UNIQUE INDEX `Member_userId_spaceId_key`(`userId`, `spaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Space` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL DEFAULT 'New Space',
    `description` VARCHAR(191) NULL,
    `personal` BOOLEAN NOT NULL DEFAULT false,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Questionnaire` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL DEFAULT 'New Questionnaire',
    `description` TEXT NULL,
    `category` INTEGER NOT NULL DEFAULT 1,
    `url` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'PAUSED') NOT NULL DEFAULT 'PAUSED',
    `timeLimit` INTEGER NULL,
    `allowReturn` BOOLEAN NOT NULL DEFAULT true,
    `structure` ENUM('INDIVIDUAL', 'LIST') NOT NULL DEFAULT 'LIST',
    `passwordProtected` BOOLEAN NOT NULL DEFAULT false,
    `password` CHAR(60) NULL,
    `spaceId` INTEGER NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Questionnaire_url_key`(`url`),
    INDEX `Questionnaire_spaceId_idx`(`spaceId`),
    INDEX `Questionnaire_url_idx`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL DEFAULT 'New question',
    `description` TEXT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `timeLimit` INTEGER NULL,
    `position` DOUBLE NOT NULL DEFAULT 10,
    `type` ENUM('TEXT', 'SELECT', 'MULTI_SELECT') NOT NULL DEFAULT 'TEXT',
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `questionnaireId` INTEGER NOT NULL,

    UNIQUE INDEX `Question_questionnaireId_position_key`(`questionnaireId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Option` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` VARCHAR(191) NOT NULL DEFAULT 'New Option',
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,
    `position` DOUBLE NOT NULL DEFAULT 10,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `questionId` INTEGER NOT NULL,

    UNIQUE INDEX `Option_questionId_position_key`(`questionId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PublishedOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `optionId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `deleted` BOOLEAN NOT NULL,

    INDEX `PublishedOption_questionId_idx`(`questionId`),
    INDEX `PublishedOption_optionId_idx`(`optionId`),
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

    INDEX `PublishedQuestion_questionId_idx`(`questionId`),
    INDEX `PublishedQuestion_questionnaireId_idx`(`questionnaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PublishedQuestionnaire` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionnaireId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL DEFAULT 'v0.0.1',
    `publisherId` INTEGER NOT NULL,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PublishedQuestionnaire_publisherId_idx`(`publisherId`),
    INDEX `PublishedQuestionnaire_questionnaireId_idx`(`questionnaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    INDEX `QuestionAnswer_answeredAt_idx`(`answeredAt`),
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
    INDEX `QuestionnaireAnswer_answeredAt_idx`(`answeredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OptionToQuestionAnswer` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OptionToQuestionAnswer_AB_unique`(`A`, `B`),
    INDEX `_OptionToQuestionAnswer_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PublishedQuestionToPublishedQuestionnaire` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PublishedQuestionToPublishedQuestionnaire_AB_unique`(`A`, `B`),
    INDEX `_PublishedQuestionToPublishedQuestionnaire_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
