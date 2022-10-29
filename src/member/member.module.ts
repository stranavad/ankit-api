import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { PrismaService } from '../prisma.service';
import { MemberController, SpaceMemberController } from './member.controller';
import { UserService } from '../user/user.service';
import { AccountService } from '../account/account.service';

@Module({
  providers: [MemberService, PrismaService, UserService, AccountService],
  exports: [MemberService],
  controllers: [MemberController, SpaceMemberController],
})
export class MemberModule {}
