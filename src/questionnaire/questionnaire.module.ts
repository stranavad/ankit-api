import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import {
  DashboardQuestionnaireController,
  GeneralQuestionnaireController,
  QuestionnaireController,
} from './questionnaire.controller';
import { PrismaService } from '../prisma.service';
import { AccountService } from '../account/account.service';
import { AuthModule } from '../auth/auth.module';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [QuestionnaireService, PrismaService, AccountService, UserService],
  controllers: [GeneralQuestionnaireController, QuestionnaireController, DashboardQuestionnaireController],
  imports: [AuthModule],
})
export class QuestionnaireModule {}
