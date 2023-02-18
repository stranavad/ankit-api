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
import { MemberId } from 'src/member.decorator';
import { PublishGuard } from 'src/publish.guard';
import { PublishedId } from 'src/published.decorator';
import { QuestionnaireId } from 'src/questionnaire.decorator';
import { QuestionnaireGuard } from 'src/questionnaire.guard';
import { RoleType } from 'src/role';
import { Roles } from 'src/roles.decorator';
import { UpdatePublishedQuestionnaireDto } from './publish.dto';
import { PublishedQuestionnaire } from './publish.interface';
import { PublishService } from './publish.service';

@Controller('publish/:id')
export class PublishController {
  constructor(private publishService: PublishService) {}

  @Get()
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.VIEW)
  getPublishedQuestionnaires(
    @QuestionnaireId() questionnaireId: number,
  ): Promise<PublishedQuestionnaire[]> {
    return this.publishService.loadPublishedQuestionnaires(questionnaireId);
  }

  @Get('status')
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.EDIT)
  checkQuestionnairePublish(
    @QuestionnaireId() questionnaireId: number,
  ): Promise<{ lastPublished: Date | null; canPublish: boolean }> {
    return this.publishService.checkQuestionnairePublish(questionnaireId);
  }

  @Get(':publishedId')
  @UseGuards(PublishGuard)
  @Roles(RoleType.EDIT)
  getPublishedQuestionnaire(@PublishedId() publishedId: number) {
    return this.publishService.getPublishedQuestionnaire(publishedId);
  }

  @Put(':publishedId')
  @UseGuards(PublishGuard)
  @Roles(RoleType.EDIT)
  updatePublishedQuestionnaire(
    @PublishedId() publishedId: number,
    @Body() body: UpdatePublishedQuestionnaireDto,
  ) {
    return this.publishService.updatePublishedQuestionnaire(publishedId, body);
  }

  @Delete(':publishedId')
  @UseGuards(PublishGuard)
  @Roles(RoleType.EDIT)
  deletePublishedQuestionnaire(@PublishedId() publishedId: number) {
    return this.publishService.deletePublishedQuestionnaire(publishedId);
  }

  @Post()
  @UseGuards(QuestionnaireGuard)
  @Roles(RoleType.EDIT)
  publishQuestionnaire(
    @Param('id') questionnaireId: number,
    @MemberId() memberId: number,
    @Body() body: UpdatePublishedQuestionnaireDto,
  ) {
    return this.publishService.publishQuestionnaire(
      questionnaireId,
      memberId,
      body,
    );
  }
}
