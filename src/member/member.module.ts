import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { PrismaService } from '../prisma.service';
import { SpaceMemberController } from './member.controller';
import { UserService } from '../user/user.service';
import { AccountService } from '../account/account.service';

@Module({
  providers: [MemberService, PrismaService, UserService, AccountService],
  exports: [MemberService],
  controllers: [SpaceMemberController],
})
export class MemberModule {}
