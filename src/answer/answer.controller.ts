import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LoadQuestionsDto } from './answer.dto';
import { AnswerQuestionnaireDto, AnswerService } from './answer.service';
import { QuestionnaireGuard } from 'src/questionnaire.guard';
import { RoleType } from 'src/role';
import { Roles } from 'src/roles.decorator';
import { QuestionnaireId } from 'src/questionnaire.decorator';
import { AnswerData } from './answer.interface';

@Controller('answer/:id')
export class AnswerController {
  constructor(private answerService: AnswerService) {}

  @Post()
  loadQuestions(@Param('id') hash: string, @Body() body: LoadQuestionsDto) {
    return this.answerService.loadQuestions(hash, body);
  }

  @Post('answer')
  answerQuestionnaire(
    @Param('id') id: number,
    @Body() body: AnswerQuestionnaireDto,
  ) {
    return this.answerService.answerQuestionnaire(id, body);
  }

  @Get('preview')
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.VIEW)
  async getQuestionnairePreview(@QuestionnaireId() questionnaireId: number): Promise<AnswerData | null> {
    return this.answerService.loadAutoPublishQuestions(questionnaireId);
  }
}
