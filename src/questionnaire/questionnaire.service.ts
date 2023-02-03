import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ApplicationQuestionnaire,
  CurrentQuestionnaire,
  DashboardQuestionnaire,
  DetailQuestionnaire,
  getApplicationQuestionnaireFromPrisma,
  getApplicationQuestionnairesFromPrisma,
  getDetailQuestionnaireFromPrisma,
  parseStatus,
  parseStructure,
  selectApplicationQuestionnaire,
  selectDetailQuestionnaire,
} from './questionnaire.interface';
import { UpdateQuestionnaireDto } from './questionnaire.dto';
import { parseRole, RoleType } from '../role';
import {
  UpdateQuestionnairePermission,
  updateQuestionnairePermissions,
} from './questionnaire.permission';
import { AuthService } from '../auth/auth.service';
import {
  ApplicationMember,
  selectApplicationMember,
} from '../member/member.interface';
import {
  ApplicationSpace,
  selectApplicationSpace,
} from '../space/space.interface';
import { QuestionnaireStatus, QuestionnaireStructure } from '@prisma/client';
import * as bcrypt from 'bcrypt'
import bcryptConfig from '../bcrypt';

const containLetters = 'abcdefghijklmnopqrstuvwxyz0123456789-';

const checkValidUrl = (url: string): boolean => {
    let valid = true;
    url.split('').map((symbol) => {
        if(!containLetters.includes(symbol)){
            valid = false;
        }
    })
    return valid;
}

@Injectable()
export class QuestionnaireService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
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

  async getCurrentInformation(
    questionnaireId: number,
    spaceId: number,
    userId: number,
  ): Promise<CurrentQuestionnaire | null> {
    const space = await this.prisma.space.findUnique({
      where: {
        id: spaceId,
      },
      select: {
        ...selectApplicationSpace,
        questionnaires: {
          where: {
            id: questionnaireId,
          },
          select: selectApplicationQuestionnaire,
        },
        members: {
          where: {
            userId,
          },
          select: selectApplicationMember,
        },
      },
    });
    if (!space) {
      return null;
    }

    const member = space.members[0];
    const questionnaire = space.questionnaires[0];

    const dataSpace: ApplicationSpace = {
      id: space.id,
      name: space.name,
      personal: space.personal,
      role: parseRole(member.role),
      username: member.name,
      accepted: member.accepted,
    };

    const dataMember: ApplicationMember = {
      id: member.id,
      name: member.name,
      role: parseRole(member.role),
      deleted: member.deleted,
      accepted: member.accepted,
      email: member.user.email,
      image: member.user.image,
      userId: member.user.id,
    };

    const dataQuestionnaire: ApplicationQuestionnaire = {
      id: questionnaire.id,
      name: questionnaire.name,
      url: questionnaire.url,
      status: questionnaire.status,
      spaceId: space.id,
    };
    return {
      space: dataSpace,
      member: dataMember,
      questionnaire: dataQuestionnaire,
    };
  }

  async getDashboardQuestionnaires(userId: number): Promise<ApplicationQuestionnaire[]>{
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
                    questionnaireAnswer: true
                  }
                }  
              },
              orderBy: {
                updated: 'desc'
              }
            }
          }
        }
      }
    });

    const questionnaires: DashboardQuestionnaire[] = [];
    members.map((member) => {
      member.space.questionnaires.map((questionnaire) => {
        questionnaires.push({...getApplicationQuestionnaireFromPrisma(questionnaire), spaceName: member.space.name, role: parseRole(member.role), answerCount: questionnaire._count.questionnaireAnswer});
      })
    })

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

  checkPerms<ValueType>(
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
    callback(value);
  }

  async updateQuestionnaire(
    data: UpdateQuestionnaireDto,
    role: RoleType,
    questionnaireId: number,
  ): Promise<DetailQuestionnaire | null> {
    const questionnaireUpdateData: QuestionnaireUpdateData = {};
    // Constructing update data
    // Name
    this.checkPerms(
      data.name,
      UpdateQuestionnairePermission.NAME,
      role,
      (value) => {
        questionnaireUpdateData.name = value;
      },
    );
    // Description
    this.checkPerms(
      data.description,
      UpdateQuestionnairePermission.DESCRIPTION,
      role,
      (value) => {
        questionnaireUpdateData.description = value;
      },
    );
    // Structure
    this.checkPerms(
      data.structure,
      UpdateQuestionnairePermission.STRUCTURE,
      role,
      (value) => {
        questionnaireUpdateData.structure = parseStructure(value);
      },
    );
    // Category
    this.checkPerms(
      data.category,
      UpdateQuestionnairePermission.CATEGORY,
      role,
      (value) => {
        questionnaireUpdateData.category = value;
      },
    );
    // Status
    this.checkPerms(
      data.status,
      UpdateQuestionnairePermission.STATUS,
      role,
      (value) => {
        questionnaireUpdateData.status = parseStatus(value);
      },
    );
    // Time Limit
    this.checkPerms(
      data.timeLimit,
      UpdateQuestionnairePermission.TIME_LIMIT,
      role,
      (value) => {
        questionnaireUpdateData.timeLimit = value;
      },
    );
    // Allow return
    this.checkPerms(
      data.allowReturn,
      UpdateQuestionnairePermission.ALLOW_RETURN,
      role,
      (value) => {
        questionnaireUpdateData.allowReturn = value;
      },
    );
    // URL
    this.checkPerms(
      data.url,
      UpdateQuestionnairePermission.URL,
      role,
      (value) => {
        questionnaireUpdateData.url = value ? checkValidUrl(value) ? value : undefined : undefined;
      }
    )
    // Password
    if(data.passwordProtected !== null){
      if(this.authService.isRoleEnough(updateQuestionnairePermissions[UpdateQuestionnairePermission.PASSWORD], role)){
        if (data.password && data.passwordProtected) {
          questionnaireUpdateData.passwordProtected = true;
          questionnaireUpdateData.password = await bcrypt.hash(data.password, bcryptConfig.saltRounds);
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
}
