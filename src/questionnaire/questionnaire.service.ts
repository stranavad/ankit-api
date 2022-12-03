import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ApplicationQuestionnaire,
  CurrentQuestionnaire,
  DetailQuestionnaire,
  getApplicationQuestionnaireFromPrisma,
  getApplicationQuestionnairesFromPrisma,
  getDetailQuestionnaireFromPrisma,
  selectApplicationQuestionnaire,
  selectDetailQuestionnaire,
  Status,
  Structure,
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
        questionnaireUpdateData.structure = value;
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
        questionnaireUpdateData.status = value;
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
    // Password
    this.checkPerms(
      data.passwordProtected,
      UpdateQuestionnairePermission.PASSWORD,
      role,
      () => {
        if (data.password !== null && data.passwordProtected) {
          questionnaireUpdateData.passwordProtected = true;
          questionnaireUpdateData.password = data.password;
        } else {
          questionnaireUpdateData.passwordProtected = false;
          questionnaireUpdateData.password = null;
        }
      },
    );

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
}

interface QuestionnaireUpdateData {
  name?: string;
  description?: string;
  structure?: Structure;
  category?: number;
  status?: Status;
  timeLimit?: number;
  allowReturn?: boolean;
  passwordProtected?: boolean;
  password?: string | null;
}
