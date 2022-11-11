import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import {
  GeneralQuestionnaireController,
  QuestionnaireController,
} from './questionnaire.controller';
import { PrismaService } from '../prisma.service';
import { AccountService } from '../account/account.service';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [QuestionnaireService, PrismaService, AccountService, AuthService],
  controllers: [GeneralQuestionnaireController, QuestionnaireController],
})
export class QuestionnaireModule {}
