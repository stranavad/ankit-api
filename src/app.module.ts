import { Module } from '@nestjs/common';
import { SpaceModule } from './space/space.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { MemberModule } from './member/member.module';

@Module({
  imports: [SpaceModule, AuthModule, AccountModule, MemberModule],
})
export class AppModule {}
