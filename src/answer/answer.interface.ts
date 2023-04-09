import { Prisma, QuestionType, QuestionnaireStructure } from '@prisma/client';
import { Design } from '../design/design.interface';

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
  optionId: number;
  value: string;
}

export const selectAnswerQuestion =
  Prisma.validator<Prisma.PublishedQuestionSelect>()({
    id: true, // Published ID
    title: true,
    required: true,
    description: true,
    type: true,
    questionId: true, // ID
    options: {
      select: {
        optionId: true, // ID
        value: true,
      },
      orderBy: {
        position: 'asc',
      },
      where: {
        deleted: false,
      },
    },
  });

export interface AnswerData {
  id: number | null;
  questionnaireId: number;
  name: string;
  description: string | null;
  structure: QuestionnaireStructure;
  publishedAt: Date;
  design: Design;
  questions: AnswerQuestion[];
}

// Data to insert interfaces
export interface AnswerInsert {
  questionId: number;
  value: string | undefined;
  options: number[];
  required: boolean;
}

export interface QuestionsMap {
  id: number;
  required: boolean;
  type: QuestionType;
  options: { id: number }[];
}
