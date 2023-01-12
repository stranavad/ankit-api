import { Prisma, QuestionType } from "@prisma/client";

export interface AnswerQuestion {
    id: number;
    publishedId: number;
    title: string;
    description: string | null;
    required: boolean;
    type: QuestionType;
    options: AnswerOption[];
}

export interface AnswerOption {
    id: number;
    publishedId: number;
    value: string;
}

export const selectAnswerQuestion = Prisma.validator<Prisma.PublishedQuestionSelect>()({
    id: true, // Published ID
    title: true,
    required: true,
    description: true,
    type: true,
    questionId: true, // ID
    options: {
        select: {
            optionId: true, // ID
            value: true
        },
        orderBy: {
            position: 'asc'
        },
        where: {
            deleted: false
        }
    }
})