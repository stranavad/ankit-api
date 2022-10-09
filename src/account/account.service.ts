import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Account } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  findAccountByAccessToken(token: string): Promise<Account | null> {
    return this.prisma.account.findFirst({
      where: {
        access_token: {
          equals: token,
        },
      },
    });
  }

  async findMemberRoleByAccountId(accountId: string, spaceId: number) {
    const member = await this.prisma.member.findFirst({
      where: {
        OR: [
          {
            AND: [
              {
                accountId,
              },
              {
                spaceOwner: {
                  id: spaceId,
                },
              },
            ],
          },
          {
            AND: [
              {
                accountId,
              },
              { spaceId },
            ],
          },
        ],
      },
    });
  }

  async findAccountByEmail(
    email: string,
  ): Promise<{ id: string; name: string } | null> {
    const account = await this.prisma.account.findFirst({
      where: {
        user: {
          email,
        },
      },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return account
      ? {
          id: account.id,
          name: account.user.name || account.user.email || 'Random user',
        }
      : null;
  }
}
