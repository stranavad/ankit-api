import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountModule } from '../account/account.module';
import { MemberModule } from '../member/member.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Global()
@Module({
  providers: [AuthService, JwtService],
  imports: [
    AccountModule,
    MemberModule,
    JwtModule.register({
      secret: 'gaURUd9jRLXf1jDo709nDJwQZy1SsJbhspvRlb50LPFMyw7JCd',
      // signOptions: { expiresIn: '24h' },
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
