import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../roles.guard';
import { Roles } from '../roles.decorator';
import { RoleType } from '../role';
import {
  CreateQuestionnaireDto,
  UpdateQuestionnaireDto,
} from './questionnaire.dto';
import { QuestionnaireService } from './questionnaire.service';
import { SpaceId } from '../space.decorator';
import { QuestionnaireId } from '../questionnaire.decorator';

@Controller('questionnaire')
export class GeneralQuestionnaireController {
  constructor(private questionnaireService: QuestionnaireService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleType.VIEW)
  getQuestionnaires(
    @Query('search') search: string | null = null,
    @SpaceId() spaceId: number,
  ) {
    return this.questionnaireService.getQuestionnaires(spaceId, search);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  createQuestionnaire(@Body() data: CreateQuestionnaireDto) {
    return this.questionnaireService.createQuestionnaire({
      name: data.name,
      spaceId: data.spaceId,
    });
  }
}

@Controller('questionnaire/:id')
export class QuestionnaireController {
  constructor(private questionnaireService: QuestionnaireService) {}

  @Put()
  @UseGuards(RolesGuard)
  @Roles(RoleType.EDIT)
  updateQuestionnaire(
    @QuestionnaireId() questionnaireId: number,
    @Body() data: UpdateQuestionnaireDto,
  ) {
    return null;
  }
}
