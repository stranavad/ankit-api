import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PrismaService } from '../prisma.service';
import { AccountService } from '../account/account.service';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService, PrismaService, AccountService, AuthService],
})
export class QuestionModule {}
