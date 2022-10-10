import { Injectable } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { Account } from '@prisma/client';
import { MemberAuth, MemberService } from '../member/member.service';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private memberService: MemberService,
  ) {}

  async getAccountDetails(token: string | null): Promise<Account | null> {
    return token
      ? await this.accountService.findAccountByAccessToken(token)
      : null;
  }

  async getAccountRole(
    token: string,
    spaceId: number,
  ): Promise<MemberAuth | null> {
    return token
      ? await this.memberService.getMemberAuthByAccountToken(token, spaceId)
      : null;
  }
}
