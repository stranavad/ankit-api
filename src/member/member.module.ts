import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [MemberService, PrismaService],
})
export class MemberModule {}
