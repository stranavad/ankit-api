import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { parseRole, RoleType } from '../role';

interface MemberAuth {
  accessToken: string | null;
  expiresAt: number | null;
  memberId: number;
  role: RoleType;
  userId: number;
}

interface UserAuth {
  id: number | null;
  accessToken: string | null;
  expiresAt: number | null;
}

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
              },
            },
          },
        },
      },
    });

    const account =
      accounts.find((account) => account.access_token === token) || null;

    if (!account) {
      return null;
    }

    return {
      accessToken: account.access_token,
      expiresAt: account.expires_at,
      memberId: account.user.members[0].id,
      role: parseRole(account.user.members[0].role),
      userId: account.user.id,
    };
  }
}
