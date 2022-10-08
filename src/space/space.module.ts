import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { PrismaService } from '../prisma.service';
import { MemberService } from '../member/member.service';

@Module({
  controllers: [SpaceController],
  providers: [SpaceService, PrismaService, MemberService],
})
export class SpaceModule {}
