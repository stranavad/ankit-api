import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { DesignService } from './design.service';
import { QuestionnaireGuard } from 'src/questionnaire.guard';
import { RoleType } from 'src/role';
import { Roles } from 'src/roles.decorator';
import { QuestionnaireId } from 'src/questionnaire.decorator';
import { Design } from './design.interface';
import { UpdateDesignDto } from './design.dto';

@Controller('questionnaire/design/:id')
export class DesignController {
    constructor(private designService: DesignService){}

    @Get()
    @UseGuards(QuestionnaireGuard)
    @Roles(RoleType.VIEW)
    async getQuestionnaireDesign(@QuestionnaireId() questionnaireId: number): Promise<null | Design>{
        return await this.designService.getQuestionnaireDesign(questionnaireId);
    }

    @Put()
    @UseGuards(QuestionnaireGuard)
    @Roles(RoleType.EDIT)
    async updateQuestionnaireDesign(@QuestionnaireId() questionnaireId: number, @Body() data: UpdateDesignDto): Promise<Design>{
        return await this.designService.updateQuestionnaireDesign(questionnaireId, data);
    }
}
