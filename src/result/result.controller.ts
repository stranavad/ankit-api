import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { QuestionnaireId } from 'src/questionnaire.decorator';
import { QuestionnaireGuard } from 'src/questionnaire.guard';
import { RoleType } from 'src/role';
import { Roles } from 'src/roles.decorator';
import { ResultService } from './result.service';
import { QuestionGuard } from 'src/question.guard';
import { QuestionId } from 'src/question.decorator';
import { QuestionnaireStatistics, Result } from './result.interface';

@Controller('result/:id')
export class ResultController {
  constructor(private resultService: ResultService) {}

  @Get()
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.VIEW)
  getAllResults(
    @QuestionnaireId() questionnaireId: number,
  ): Promise<{ questions: Result[] }> {
    return this.resultService.getAllResults(questionnaireId);
  }

  @Get('statistics')
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.VIEW)
  getQuestionnaireStatistics(
    @QuestionnaireId() questionnaireId: number,
  ): Promise<QuestionnaireStatistics> {
    return this.resultService.getQuestionnaireStatistics(questionnaireId);
  }

  @Delete(':questionId/answer/:answerId')
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  deleteAnswer(
    @QuestionId() questionId: number,
    @Param('answerId', ParseIntPipe) answerId: number,
  ): Promise<Result> {
    return this.resultService.deleteAnswer(answerId, questionId);
  }
}
