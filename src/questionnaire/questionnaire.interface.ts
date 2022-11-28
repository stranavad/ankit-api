import { Prisma } from '@prisma/client';
import { ApplicationSpace } from '../space/space.interface';
import { ApplicationMember } from '../member/member.interface';

export enum Structure {
  LIST = 'list',
  INDIVIDUAL = 'individual',
}

export const parseStructure = (structure: string): Structure => {
  switch (structure) {
    case Structure.LIST:
      return Structure.LIST;
    case Structure.INDIVIDUAL:
      return Structure.INDIVIDUAL;
    default:
      return Structure.LIST;
  }
};

export enum Status {
  ACTIVE = 'active',
  PAUSED = 'paused',
}

export enum QuestionType {
  SELECT = 'select',
  MULTI_SELECT = 'multiselect',
  TEXT = 'text',
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

/* DETAIL QUESTIONNAIRE */
export interface DetailQuestionnaire extends ApplicationQuestionnaire {
  description: string | null;
  category: number;
  timeLimit: number | null;
  allowReturn: boolean;
  structure: Structure;
  passwordProtected: boolean;
  password: string | null;
}
export interface PrismaDetailQuestionnaire
  extends PrismaApplicationQuestionnaire {
  description: string | null;
  category: number;
  timeLimit: number | null;
  allowReturn: boolean;
  structure: string;
  passwordProtected: boolean;
  password: string | null;
}

export const selectDetailQuestionnaire =
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
    description: true,
    category: true,
    timeLimit: true,
    allowReturn: true,
    structure: true,
    passwordProtected: true,
    password: true,
  });

export const getDetailQuestionnaireFromPrisma = (
  data: PrismaDetailQuestionnaire,
): DetailQuestionnaire => ({
  id: data.id,
  name: data.name,
  url: data.url,
  status: data.status,
  spaceId: data.space.id,
  description: data.description,
  category: data.category,
  timeLimit: data.timeLimit,
  allowReturn: data.allowReturn,
  structure: parseStructure(data.structure),
  passwordProtected: data.passwordProtected,
  password: data.password,
});

export interface CurrentQuestionnaire {
  space: ApplicationSpace;
  member: ApplicationMember;
  questionnaire: ApplicationQuestionnaire;
}
