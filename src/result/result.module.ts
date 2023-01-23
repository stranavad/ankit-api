import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { AccountService } from 'src/account/account.service';

@Module({
  providers: [ResultService, PrismaService, AccountService],
  controllers: [ResultController],
  imports: [AuthModule]
})
export class ResultModule {}
