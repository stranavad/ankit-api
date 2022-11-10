import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ApplicationQuestionnaire,
  getApplicationQuestionnaireFromPrisma,
  getApplicationQuestionnairesFromPrisma,
  selectApplicationQuestionnaire,
} from './questionnaire.interface';

@Injectable()
export class QuestionnaireService {
  constructor(private prisma: PrismaService) {}

  async getQuestionnaires(
    spaceId: number,
    search: string | null,
  ): Promise<ApplicationQuestionnaire[]> {
    let where;
    if (search) {
      where = {
        AND: [
          {
            spaceId,
          },
          {
            name: {
              contains: search,
            },
          },
        ],
      };
    } else {
      where = {
        spaceId,
      };
    }
    const questionnaires = await this.prisma.questionnaire.findMany({
      where,
      select: selectApplicationQuestionnaire,
    });
    return getApplicationQuestionnairesFromPrisma(questionnaires);
  }

  async createQuestionnaire({
    name,
    spaceId,
  }: {
    name: string;
    spaceId: number;
  }) {
    const questionnaire = await this.prisma.questionnaire.create({
      data: {
        name,
        space: {
          connect: {
            id: spaceId,
          },
        },
      },
      select: selectApplicationQuestionnaire,
    });
    return getApplicationQuestionnaireFromPrisma(questionnaire);
  }
}
