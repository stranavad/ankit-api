import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { QuestionnaireGuard } from '../questionnaire.guard';
import { RoleType } from '../role';
import { QuestionnaireId } from '../questionnaire.decorator';
import { Roles } from '../roles.decorator';
import { Question } from './question.interface';
import { QuestionService } from './question.service';
import { QuestionId } from '../question.decorator';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from './question.dto';

@Controller('questionnaire/:id/question')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Get()
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.VIEW)
  getQuestions(
    @QuestionnaireId() questionnaireId: number,
  ): Promise<Question[]> {
    return this.questionService.loadQuestions(questionnaireId);
  }

  @Post()
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.EDIT)
  createQuestion(
    @QuestionnaireId() questionnaireId: number,
    @Body() body: CreateQuestionDto,
  ) {
    return this.questionService.createQuestion(questionnaireId, body);
  }

  @Put(':questionId')
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.EDIT)
  updateQuestion(
    @QuestionId() questionId: number,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.questionService.updateQuestion(questionId, body);
  }

  @Put(':questionId/type')
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.EDIT)
  updateQuestionType(
    @QuestionId() questionId: number,
    @Body() data: UpdateQuestionTypeDto,
  ) {
    return this.questionService.updateQuestionType(questionId, data);
  }
}
