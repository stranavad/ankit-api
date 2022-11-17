import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { parseRole } from '../role';
import {
  MemberAuth,
  QuestionnaireAuth,
  UserAuth,
} from '../auth/auth.interface';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async findAccountByUserId(
    userId: number,
    accessToken: string,
  ): Promise<UserAuth | null> {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
      },
      select: {
        access_token: true,
        expires_at: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    const account =
      accounts.find((account) => account.access_token === accessToken) || null;

    return account
      ? {
          id: account.user.id,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
        }
      : null;
  }

  async getMemberDetailsByAccessTokenQuestionnaire(
    userId: number,
    token: string,
    questionnaireId: number,
  ): Promise<QuestionnaireAuth | null> {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: {
        id: questionnaireId,
      },
      select: {
        id: true,
        space: {
          select: {
            id: true,
            members: {
              where: {
                userId: userId,
              },
              select: {
                id: true,
                role: true,
                user: {
                  select: {
                    id: true,
                    accounts: {
                      where: {
                        access_token: token,
                      },
                      select: {
                        access_token: true,
                        expires_at: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !questionnaire ||
      !questionnaire.space.members[0].user.accounts.length
    ) {
      return null;
    }

    const member = questionnaire.space.members[0];
    const user = questionnaire.space.members[0].user;
    const account = questionnaire.space.members[0].user.accounts[0];

    return {
      accessToken: account.access_token,
      expiresAt: account.expires_at,
      memberId: member.id,
      role: parseRole(member.role),
      userId: user.id,
      spaceId: questionnaire.space.id,
      questionnaireId: questionnaire.id,
    };
  }

  async getMemberDetailsByAccessToken(
    userId: number,
    token: string,
    spaceId: number,
  ): Promise<MemberAuth | null> {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
      },
      select: {
        access_token: true,
        expires_at: true,
        user: {
          select: {
            id: true,
            members: {
              where: {
                spaceId,
              },
              select: {
                id: true,
                role: true,
                space: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const account =
      accounts.find((account) => account.access_token === token) || null;

    if (!account || !account.user.members[0]?.space?.id) {
      return null;
    }

    return {
      accessToken: account.access_token,
      expiresAt: account.expires_at,
      memberId: account.user.members[0].id,
      role: parseRole(account.user.members[0].role),
      userId: account.user.id,
      spaceId: account.user.members[0].space.id,
    };
  }
}
