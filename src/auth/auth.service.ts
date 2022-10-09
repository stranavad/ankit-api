import { Injectable } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { Account } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private accountService: AccountService) {}

  async getAccountDetails(token: string | null): Promise<Account | null> {
    return token
      ? await this.accountService.findAccountByAccessToken(token)
      : null;
  }

  async getAccountRole(accountId: string, spaceId: number) {
    return true;
  }
}
