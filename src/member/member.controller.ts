import { Body, Controller, Post } from '@nestjs/common';
import { MemberService } from './member.service';

// @UseGuards(AuthGuard)
@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  // IMPORTANT
  // DOESN'T HAVE AUTH GUARD
  @Post()
  async createDefaultMember(@Body('userId') userId: number) {
    await this.memberService.createDefaultMember(userId);
    return;
  }
}
