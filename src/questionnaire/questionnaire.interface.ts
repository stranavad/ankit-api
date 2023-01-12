import { Prisma, QuestionnaireStatus } from '@prisma/client';
import { ApplicationSpace } from '../space/space.interface';
import { ApplicationMember } from '../member/member.interface';
import { QuestionnaireStructure } from '@prisma/client';

export const parseStructure = (structure: string | undefined): QuestionnaireStructure => {
  switch (structure) {
    case QuestionnaireStructure.LIST:
    case "list": 
      return QuestionnaireStructure.LIST;
    case QuestionnaireStructure.INDIVIDUAL:
    case "individual":  
      return QuestionnaireStructure.INDIVIDUAL;
    default:
      return QuestionnaireStructure.LIST;
  }
};

export const parseStatus = (status: string | undefined): QuestionnaireStatus | undefined => {
  switch(status){
    case QuestionnaireStatus.ACTIVE:
    case "active":
      return QuestionnaireStatus.ACTIVE;
    case QuestionnaireStatus.PAUSED:
    case "paused":
      return QuestionnaireStatus.PAUSED
    default :
      return undefined;      
  }
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
  structure: QuestionnaireStructure;
  passwordProtected: boolean;
}
export interface PrismaDetailQuestionnaire
  extends PrismaApplicationQuestionnaire {
  description: string | null;
  category: number;
  timeLimit: number | null;
  allowReturn: boolean;
  structure: string;
  passwordProtected: boolean;
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
});

export interface CurrentQuestionnaire {
  space: ApplicationSpace;
  member: ApplicationMember;
  questionnaire: ApplicationQuestionnaire;
}
