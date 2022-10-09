import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { PrismaService } from '../prisma.service';
import { MemberService } from '../member/member.service';
import { AccountService } from '../account/account.service';

@Module({
  controllers: [SpaceController],
  providers: [SpaceService, PrismaService, MemberService, AccountService],
})
export class SpaceModule {}
