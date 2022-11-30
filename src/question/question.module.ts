import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PrismaService } from '../prisma.service';
import { AccountService } from '../account/account.service';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService, PrismaService, AccountService],
  imports: [AuthModule],
})
export class QuestionModule {}
