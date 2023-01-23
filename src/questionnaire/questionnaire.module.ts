import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import {
  GeneralQuestionnaireController,
  QuestionnaireController,
} from './questionnaire.controller';
import { PrismaService } from '../prisma.service';
import { AccountService } from '../account/account.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [QuestionnaireService, PrismaService, AccountService],
  controllers: [GeneralQuestionnaireController, QuestionnaireController],
  imports: [AuthModule],
})
export class QuestionnaireModule {}
