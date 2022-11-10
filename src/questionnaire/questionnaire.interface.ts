import { Prisma } from '@prisma/client';

export enum Structure {
  LIST = 'list',
  INDIVIDUAL = 'individual',
}

export enum Status {
  ACTIVE = 'active',
  PAUSED = 'paused',
}

export interface ApplicationQuestionnaire {
  id: number;
  name: string;
  url: string | null;
  status: string;
  spaceId: number;
}

export interface PrismaApplicationQuestionnaire {
  id: number;
  name: string;
  url: string | null;
  status: string;
  space: {
    id: number;
  };
}

export const selectApplicationQuestionnaire =
  Prisma.validator<Prisma.QuestionnaireSelect>()({
    id: true,
    name: true,
    url: true,
    status: true,
    space: {
      select: {
        id: true,
      },
    },
  });

export const getApplicationQuestionnaireFromPrisma = (
  data: PrismaApplicationQuestionnaire,
): ApplicationQuestionnaire => ({
  id: data.id,
  name: data.name,
  url: data.url,
  status: data.status,
  spaceId: data.space.id,
});

export const getApplicationQuestionnairesFromPrisma = (
  questionnaires: PrismaApplicationQuestionnaire[],
): ApplicationQuestionnaire[] =>
  questionnaires.map(getApplicationQuestionnaireFromPrisma);
