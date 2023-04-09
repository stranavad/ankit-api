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
import { PublishService } from '../publish/publish.service';
import { DesignService } from '../design/design.service';
import { DesignController } from 'src/design/design.controller';

@Module({
  providers: [
    QuestionnaireService,
    DesignService,
    PrismaService,
    AccountService,
    UserService,
    PublishService,
  ],
  controllers: [
    GeneralQuestionnaireController,
    QuestionnaireController,
    DashboardQuestionnaireController,
    DesignController,
  ],
  imports: [AuthModule],
})
export class QuestionnaireModule {}
