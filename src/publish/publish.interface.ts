import { Prisma } from "@prisma/client";

export interface PublishedQuestionnaire {
    id: number;
    questionnaireId: number;
    version: string;
    name: string;
    publishedAt: Date;
    publisher: {
        id: number;
        name: string;
    }
}

export const selectPublishedQuestionnaire = Prisma.validator<Prisma.PublishedQuestionnaireSelect>()({
    id: true,
    questionnaireId: true,
    version: true,
    name: true,
    publishedAt: true,
    publisher: {
        select: {
            id: true,
            name: true,
        }
    }
  });