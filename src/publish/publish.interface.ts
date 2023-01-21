import { Option, Prisma, Question } from "@prisma/client";

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

export interface QuestionToPublish extends Pick<Question, 'id' | 'title' | 'description' | 'updated' | 'visible' | 'required' | 'deleted' |
'position' | 'type'>{
    options: Pick<Option, 'id' | 'value'  | 'deleted'>[]
}

export const selectQuestionsToPublish = Prisma.validator<Prisma.QuestionSelect>()({
    id: true,
    title: true,
    description: true,
    updated: true,
    visible: true,
    required: true,
    deleted: true,
    position: true,
    type: true,
    options: {
        select: {
            id: true,
            value: true,
            deleted: true,
        },
        orderBy: {
            position: 'asc'
        }
    }
})