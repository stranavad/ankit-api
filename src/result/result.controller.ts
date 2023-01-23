import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QuestionnaireId } from 'src/questionnaire.decorator';
import { QuestionnaireGuard } from 'src/questionnaire.guard';
import { RoleType } from 'src/role';
import { Roles } from 'src/roles.decorator';
import { ResultService } from './result.service';

@Controller('result/:id')
export class ResultController {
    constructor(private resultService: ResultService){}

    @Get()
    // @UseGuards(QuestionnaireGuard)
    // @Roles(RoleType.VIEW)
    getAllResults(@Param('id') questionnaireId: number){
        return this.resultService.getAllResults(questionnaireId);
    }
}
