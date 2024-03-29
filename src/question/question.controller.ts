import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QuestionnaireGuard } from '../questionnaire.guard';
import { RoleType } from '../role';
import { QuestionnaireId } from '../questionnaire.decorator';
import { Roles } from '../roles.decorator';
import { Question } from './question.interface';
import { QuestionService } from './question.service';
import { QuestionId } from '../question.decorator';
import {
  AddOptionDto,
  CreateQuestionDto,
  UpdateOptionDto,
  UpdatePositionDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from './question.dto';
import { QuestionGuard } from 'src/question.guard';

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
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  updateQuestion(
    @QuestionId() questionId: number,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.questionService.updateQuestion(questionId, body);
  }

  @Post(':questionId/option')
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  createOption(@QuestionId() questionId: number, @Body() body: AddOptionDto) {
    return this.questionService.addOption(questionId, body.value);
  }

  @Put(':questionId/option/:optionId')
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  updateOptionValue(
    @Body() data: UpdateOptionDto,
    @Param('optionId') optionId: number,
  ) {
    return this.questionService.updateOption(optionId, data);
  }

  @Delete(':questionId/option/:optionId')
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  deleteOption(@Param('optionId') optionId: number) {
    return this.questionService.deleteOption(optionId);
  }

  @Put('position')
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.EDIT)
  updateQuestionPosition(
    @QuestionnaireId() questionnaireId: number,
    @Body() body: UpdatePositionDto,
  ): Promise<Question[] | null> {
    return this.questionService.updateQuestionPosition(questionnaireId, body);
  }

  @Put(':questionId/option/position')
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  updateOptionPosition(
    @QuestionId() questionId: number,
    @Body() body: UpdatePositionDto,
  ) {
    return this.questionService.updateOptionPosition(questionId, body);
  }

  @Put(':questionId/type')
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  updateQuestionType(
    @QuestionId() questionId: number,
    @Body() data: UpdateQuestionTypeDto,
  ) {
    return this.questionService.updateQuestionType(questionId, data);
  }

  @Delete(':questionId')
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  deleteQuestion(@QuestionId() questionId: number) {
    return this.questionService.deleteQuestion(questionId);
  }

  @Post(':questionId/duplicate')
  @UseGuards(QuestionGuard)
  @Roles(RoleType.EDIT)
  duplicateQuestion(
    @QuestionId() questionId: number,
  ): Promise<Question[] | null> {
    return this.questionService.duplicateQuestion(questionId);
  }
}
