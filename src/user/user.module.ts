import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { SpaceService } from '../space/space.service';
import { MemberService } from '../member/member.service';
import { AccountService } from '../account/account.service';

@Module({
  providers: [
    UserService,
    PrismaService,
    SpaceService,
    MemberService,
    AccountService,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
