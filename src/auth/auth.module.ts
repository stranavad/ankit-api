import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountModule } from '../account/account.module';
import { MemberModule } from '../member/member.module';

@Global()
@Module({
  providers: [AuthService],
  imports: [AccountModule, MemberModule],
  exports: [AuthService],
})
export class AuthModule {}
