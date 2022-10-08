import { Controller, Get, UseGuards, Post } from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AccountId } from '../account.decorator';
import { MemberService } from '../member/member.service';

@Controller('space')
@UseGuards(AuthGuard)
export class SpaceController {
  constructor(private memberService: MemberService) {}
  @Get()
  returnSomething(@AccountId() accountId: string) {
    console.log(accountId);
    return accountId;
  }
  @Post()
  async createSpace(@AccountId() accountId: string) {
    return await this.memberService.createMemberWithSpace(
      accountId,
      'member name',
      true,
    );
  }
}
