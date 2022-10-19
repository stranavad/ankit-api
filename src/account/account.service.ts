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

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  // async findAccountByEmail(
  //   email: string,
  // ): Promise<{ id: string; name: string } | null> {
  //   const account = await this.prisma.account.findFirst({
  //     where: {
  //       user: {
  //         email,
  //       },
  //     },
  //     select: {
  //       id: true,
  //       user: {
  //         select: {
  //           name: true,
  //           email: true,
  //         },
  //       },
  //     },
  //   });
  //   return account
  //     ? {
  //         id: account.id,
  //         name: account.user.name || account.user.email || 'Random user',
  //       }
  //     : null;
  // }
  async getMemberDetailsByAccessToken(
    accountId: number,
    token: string,
    spaceId: number,
  ): Promise<MemberAuth | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        id: accountId,
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
