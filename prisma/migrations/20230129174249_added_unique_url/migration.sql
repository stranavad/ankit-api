/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Questionnaire` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Questionnaire_url_key` ON `Questionnaire`(`url`);
