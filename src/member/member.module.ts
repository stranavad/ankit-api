import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { PrismaService } from '../prisma.service';
import { MemberController } from './member.controller';
import { UserService } from '../user/user.service';

@Module({
  providers: [MemberService, PrismaService, UserService],
  exports: [MemberService],
  controllers: [MemberController],
})
export class MemberModule {}
