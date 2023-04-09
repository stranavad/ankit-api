import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountModule } from '../account/account.module';
import { MemberModule } from '../member/member.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';

@Global()
@Module({
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
  imports: [
    AccountModule,
    MemberModule,
    JwtModule.register({
      secret: 'gaURUd9jRLXf1jDo709nDJwQZy1SsJbhspvRlb50LPFMyw7JCd',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
