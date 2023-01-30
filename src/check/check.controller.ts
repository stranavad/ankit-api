import { Controller, Get, Query } from '@nestjs/common';
import { CheckService } from './check.service';
import { CheckQuestionnaireUrlDto } from './check.dto';

@Controller('check')
export class CheckController {
    constructor(private checkService: CheckService) {}

    @Get('questionnaire-url')
    async checkQuestionnaireUrl(@Query() query: CheckQuestionnaireUrlDto): Promise<Boolean>{
        return this.checkService.checkQuestionnaireUrl(query.url);
    }
}
