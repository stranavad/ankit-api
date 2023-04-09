import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ApplicationQuestionnaire,
  DashboardQuestionnaire,
  DetailQuestionnaire,
  getApplicationQuestionnaireFromPrisma,
  getApplicationQuestionnairesFromPrisma,
  getDetailQuestionnaireFromPrisma,
  parseStatus,
  parseStructure,
  selectApplicationQuestionnaire,
  selectDashboardQuestionnaire,
  selectDetailQuestionnaire,
} from './questionnaire.interface';
import { UpdateQuestionnaireDto } from './questionnaire.dto';
import { parseRole, RoleType } from '../role';
import {
  UpdateQuestionnairePermission,
  updateQuestionnairePermissions,
} from './questionnaire.permission';
import { AuthService } from '../auth/auth.service';
import { QuestionnaireStatus, QuestionnaireStructure } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import bcryptConfig from '../bcrypt';
import { PublishService } from '../publish/publish.service';

const containLetters = 'abcdefghijklmnopqrstuvwxyz0123456789-';

const checkValidUrl = (url: string): boolean => {
  let valid = true;
  url.split('').map((symbol) => {
    if (!containLetters.includes(symbol)) {
      valid = false;
    }
  });
  return valid;
};

@Injectable()
export class QuestionnaireService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private publishService: PublishService,
  ) {}

  async getQuestionnaire(id: number): Promise<DetailQuestionnaire | null> {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: {
        id,
      },
      select: selectDetailQuestionnaire,
    });
    return questionnaire
      ? getDetailQuestionnaireFromPrisma(questionnaire)
      : null;
  }

  async getDashboardQuestionnairesV2(userId: number): Promise<DashboardQuestionnaire[]>{
    const questionnaires = await this.prisma.questionnaire.findMany({
      where: {
        space: {
          members: {
            some: {
              userId,
            }
          }
        }
      },
      select: {
        ...selectDashboardQuestionnaire,
        _count: {
          select: {
            questionnaireAnswer: true,
          }
        },
        space: {
          select: {
            id: true,
            name: true,
            members: {
              where: {
                userId,
              },
              select: {
                role: true,
              }
            }
          }
        }
      },
      orderBy: {
        updated: 'desc',
      }
    });

    const data: DashboardQuestionnaire[] = [];
    questionnaires.map((questionnaire) => {
      data.push({
        ...getApplicationQuestionnaireFromPrisma(questionnaire),
        spaceName: questionnaire.space.name,
        role: parseRole(questionnaire.space.members[0].role),
        answerCount: questionnaire._count.questionnaireAnswer
      })
    });

    return data;
  }

  // TODO move over to new version
  async getDashboardQuestionnaires(
    userId: number,
  ): Promise<ApplicationQuestionnaire[]> {
    const members = await this.prisma.member.findMany({
      where: {
        userId,
      },
      select: {
        role: true,
        space: {
          select: {
            name: true,
            questionnaires: {
              select: {
                ...selectApplicationQuestionnaire,
                _count: {
                  select: {
                    questionnaireAnswer: true,
                  },
                },
              },
              orderBy: {
                updated: 'desc',
              },
            },
          },
        },
      },
    });

    const questionnaires: DashboardQuestionnaire[] = [];
    members.map((member) => {
      member.space.questionnaires.map((questionnaire) => {
        questionnaires.push({
          ...getApplicationQuestionnaireFromPrisma(questionnaire),
          spaceName: member.space.name,
          role: parseRole(member.role),
          answerCount: questionnaire._count.questionnaireAnswer,
        });
      });
    });

    return questionnaires;
  }

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
      orderBy: {
        updated: 'desc',
      },
    });
    return getApplicationQuestionnairesFromPrisma(questionnaires);
  }

  async createQuestionnaire({
    name,
    spaceId,
  }: {
    name: string;
    spaceId: number;
  }): Promise<ApplicationQuestionnaire> {
    const questionnaire = await this.prisma.questionnaire.create({
      data: {
        name,
        space: {
          connect: {
            id: spaceId,
          },
        },
        questions: {
          create: {},
        },
      },
      select: selectApplicationQuestionnaire,
    });
    return getApplicationQuestionnaireFromPrisma(questionnaire);
  }

  async checkPerms<ValueType>(
    value: ValueType | null,
    permissions: UpdateQuestionnairePermission,
    role: RoleType,
    callback: (value: ValueType) => void,
  ) {
    if (
      value === null ||
      !this.authService.isRoleEnough(
        updateQuestionnairePermissions[permissions],
        role,
      ) ||
      typeof value === 'undefined'
    ) {
      return;
    }
    await callback(value);
  }

  async updateQuestionnaire(
    data: UpdateQuestionnaireDto,
    role: RoleType,
    questionnaireId: number,
  ): Promise<DetailQuestionnaire | null> {
    const questionnaireUpdateData: QuestionnaireUpdateData = {};
    // Constructing update data
    // Name
    await this.checkPerms(
      data.name,
      UpdateQuestionnairePermission.NAME,
      role,
      (value) => {
        questionnaireUpdateData.name = value;
      },
    );
    // Description
    await this.checkPerms(
      data.description,
      UpdateQuestionnairePermission.DESCRIPTION,
      role,
      (value) => {
        questionnaireUpdateData.description = value;
      },
    );
    // Structure
    await this.checkPerms(
      data.structure,
      UpdateQuestionnairePermission.STRUCTURE,
      role,
      (value) => {
        questionnaireUpdateData.structure = parseStructure(value);
      },
    );
    // Category
    await this.checkPerms(
      data.category,
      UpdateQuestionnairePermission.CATEGORY,
      role,
      (value) => {
        questionnaireUpdateData.category = value;
      },
    );
    // Status
    await this.checkPerms(
      data.status,
      UpdateQuestionnairePermission.STATUS,
      role,
      async (value) => {
        if (value === QuestionnaireStatus.ACTIVE) {
          const {published, manualPublish} =
            await this.publishService.checkIsQuestionnairePublished(
              questionnaireId,
            );
            
          if (published || !manualPublish ) {
            questionnaireUpdateData.status = parseStatus(value);
          }
        } else {
          questionnaireUpdateData.status = parseStatus(value);
        }
      },
    );
    // Time Limit
    await this.checkPerms(
      data.timeLimit,
      UpdateQuestionnairePermission.TIME_LIMIT,
      role,
      (value) => {
        questionnaireUpdateData.timeLimit = value;
      },
    );
    // Allow return
    await this.checkPerms(
      data.allowReturn,
      UpdateQuestionnairePermission.ALLOW_RETURN,
      role,
      (value) => {
        questionnaireUpdateData.allowReturn = value;
      },
    );
    // Manual publish
    await this.checkPerms(
      data.manualPublish,
      UpdateQuestionnairePermission.MANUAL_PUBLISH,
      role,
      (value) => {
        questionnaireUpdateData.manualPublish = value;
      }
    )
    // URL
    await this.checkPerms(
      data.url,
      UpdateQuestionnairePermission.URL,
      role,
      (value) => {
        questionnaireUpdateData.url = value
          ? checkValidUrl(value)
            ? value
            : undefined
          : undefined;
      },
    );
    // Password
    if (data.passwordProtected !== null) {
      if (
        this.authService.isRoleEnough(
          updateQuestionnairePermissions[
            UpdateQuestionnairePermission.PASSWORD
          ],
          role,
        )
      ) {
        if (data.password && data.passwordProtected) {
          questionnaireUpdateData.passwordProtected = true;
          questionnaireUpdateData.password = await bcrypt.hash(
            data.password,
            bcryptConfig.saltRounds,
          );
        } else {
          questionnaireUpdateData.passwordProtected = false;
          questionnaireUpdateData.password = null;
        }
      }
    }

    const questionnaire = await this.prisma.questionnaire.update({
      where: {
        id: questionnaireId,
      },
      data: questionnaireUpdateData,
      select: selectDetailQuestionnaire,
    });

    return questionnaire
      ? getDetailQuestionnaireFromPrisma(questionnaire)
      : null;
  }

  async deleteQuestionnaire(id: number): Promise<boolean> {
    await this.prisma.questionnaire.delete({
      where: {
        id,
      },
    });
    return true;
  }
}

interface QuestionnaireUpdateData {
  name?: string;
  description?: string;
  structure?: QuestionnaireStructure;
  category?: number;
  status?: QuestionnaireStatus;
  timeLimit?: number;
  allowReturn?: boolean;
  passwordProtected?: boolean;
  password?: string | null;
  url?: string;
  manualPublish?: boolean;
}
