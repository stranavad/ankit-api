import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import {
  GeneralQuestionnaireController,
  QuestionnaireController,
} from './questionnaire.controller';
import { PrismaService } from '../prisma.service';
import { AccountService } from '../account/account.service';

@Module({
  providers: [QuestionnaireService, PrismaService, AccountService],
  controllers: [GeneralQuestionnaireController, QuestionnaireController],
})
export class QuestionnaireModule {}
