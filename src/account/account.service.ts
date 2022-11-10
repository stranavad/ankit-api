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
    memberId: number,
    questionnaireId: number,
  ): Promise<QuestionnaireAuth | null> {
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
                id: memberId,
              },
              select: {
                id: true,
                role: true,
                space: {
                  select: {
                    id: true,
                    questionnaires: {
                      where: {
                        id: questionnaireId,
                      },
                      select: {
                        id: true,
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

    const account =
      accounts.find((account) => account.access_token === token) || null;

    if (!account || !account.user.members[0]?.space?.questionnaires[0]?.id) {
      return null;
    }

    return {
      accessToken: account.access_token,
      expiresAt: account.expires_at,
      memberId: account.user.members[0].id,
      role: parseRole(account.user.members[0].role),
      userId: account.user.id,
      spaceId: account.user.members[0].space.id,
      questionnaireId: account.user.members[0].space.questionnaires[0].id,
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
