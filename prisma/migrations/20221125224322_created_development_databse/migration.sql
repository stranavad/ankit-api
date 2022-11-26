-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_spaceId_fkey`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- CreateTable
CREATE TABLE `Questionnaire` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL DEFAULT 'New Questionnaire',
    `description` TEXT NULL,
    `category` INTEGER NOT NULL DEFAULT 1,
    `url` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'paused',
    `timeLimit` INTEGER NULL,
    `allowReturn` BOOLEAN NOT NULL DEFAULT true,
    `structure` VARCHAR(191) NOT NULL DEFAULT 'list',
    `passwordProtected` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(191) NULL,
    `spaceId` INTEGER NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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
    `position` DOUBLE NOT NULL DEFAULT 0,
    `type` VARCHAR(191) NOT NULL DEFAULT 'text',
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `questionnaireId` INTEGER NOT NULL,

    UNIQUE INDEX `Question_questionnaireId_position_key`(`questionnaireId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Member_userId_idx` ON `Member`(`userId`);
