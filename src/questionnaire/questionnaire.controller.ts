import {
  Body,
  Controller,
  Delete,
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
import { Role } from '../role.decorator';
import {
  ApplicationQuestionnaire,
  DetailQuestionnaire,
} from './questionnaire.interface';
import { QuestionnaireGuard } from '../questionnaire.guard';
import { UserId } from '../user.decorator';
import { AuthGuard } from 'src/auth.guard';

@Controller('questionnaire/dashboard')
export class DashboardQuestionnaireController {
  constructor(private questionnaireService: QuestionnaireService) {}

  @Get()
  @UseGuards(AuthGuard)
  getDashboardQuestionnaires(
    @UserId() userId: number,
  ): Promise<ApplicationQuestionnaire[]> {
    return this.questionnaireService.getDashboardQuestionnaires(userId);
  }
}

@Controller('questionnaire/space/:id')
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
  createQuestionnaire(
    @Body() data: CreateQuestionnaireDto,
    @SpaceId() spaceId: number,
  ): Promise<ApplicationQuestionnaire> {
    return this.questionnaireService.createQuestionnaire({
      name: data.name,
      spaceId: spaceId,
    });
  }
}

@Controller('questionnaire/:id')
export class QuestionnaireController {
  constructor(private questionnaireService: QuestionnaireService) {}

  @Get()
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.VIEW)
  getQuestionnaire(
    @QuestionnaireId() questionnaireId: number,
  ): Promise<DetailQuestionnaire | null> {
    return this.questionnaireService.getQuestionnaire(questionnaireId);
  }

  @Put()
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.EDIT)
  updateQuestionnaire(
    @QuestionnaireId() questionnaireId: number,
    @Body() data: UpdateQuestionnaireDto,
    @Role() role: RoleType,
  ) {
    return this.questionnaireService.updateQuestionnaire(
      data,
      role,
      questionnaireId,
    );
  }

  @Delete()
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.ADMIN)
  deleteQuestionnaire(
    @QuestionnaireId() questionnaireId: number,
  ): Promise<boolean> {
    return this.questionnaireService.deleteQuestionnaire(questionnaireId);
  }
}
