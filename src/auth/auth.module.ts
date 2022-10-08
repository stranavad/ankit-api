import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountModule } from '../account/account.module';

@Global()
@Module({
  providers: [AuthService],
  imports: [AccountModule],
  exports: [AuthService],
})
export class AuthModule {}
