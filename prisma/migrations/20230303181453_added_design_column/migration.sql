/*
  Warnings:

  - Added the required column `design` to the `Questionnaire` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Questionnaire` ADD COLUMN `design` JSON NOT NULL;
