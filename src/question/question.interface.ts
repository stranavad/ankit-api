/* QUESTION */
import { Prisma } from '@prisma/client';
import { QuestionType } from '../questionnaire/questionnaire.interface';

export const selectQuestion = Prisma.validator<Prisma.QuestionSelect>()({
  id: true,
  title: true,
  description: true,
  visible: true,
  required: true,
  position: true,
  type: true,
  options: {
    select: {
      id: true,
      value: true,
      position: true,
    },
  },
});

export interface PrismaQuestion extends Omit<Question, 'type'> {
  type: string;
}

export const parseType = (type: string): QuestionType => {
  switch (type) {
    case QuestionType.TEXT:
      return QuestionType.TEXT;
    case QuestionType.MULTI_SELECT:
      return QuestionType.MULTI_SELECT;
    case QuestionType.SELECT:
      return QuestionType.SELECT;
    default:
      return QuestionType.TEXT;
  }
};
export const getQuestionFromPrisma = (question: PrismaQuestion): Question => ({
  ...question,
  type: parseType(question.type),
});
export const getQuestionsFromPrisma = (
  questions: PrismaQuestion[],
): Question[] => questions.map(getQuestionFromPrisma);

export interface Question {
  id: number;
  title: string;
  description: string | null;
  visible: boolean;
  required: boolean;
  position: number;
  type: QuestionType;
  options?: Option[];
}

export interface Option {
  id: number;
  value: string;
  position: number;
}
