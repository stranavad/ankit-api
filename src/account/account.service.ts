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
}
