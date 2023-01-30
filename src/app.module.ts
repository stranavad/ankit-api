import { Module } from '@nestjs/common';
import { SpaceModule } from './space/space.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { MemberModule } from './member/member.module';
import { UserModule } from './user/user.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { QuestionModule } from './question/question.module';
import { PublishModule } from './publish/publish.module';
import { AnswerModule } from './answer/answer.module';
import { ResultModule } from './result/result.module';
import { CheckModule } from './check/check.module';

@Module({
  imports: [
    SpaceModule,
    AuthModule,
    AccountModule,
    MemberModule,
    UserModule,
    QuestionnaireModule,
    QuestionModule,
    PublishModule,
    AnswerModule,
    ResultModule,
    CheckModule,
  ],
})
export class AppModule {}
