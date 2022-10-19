import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AccountUserAuth } from './account.interface';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  findAccountByAccessToken(token: string): Promise<AccountUserAuth | null> {
    return this.prisma.account.findFirst({
      where: {
        access_token: {
          equals: token,
        },
      },
      select: {
        expires_at: true,
        user: {
          select: {
            id: true,
          },
        },
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
