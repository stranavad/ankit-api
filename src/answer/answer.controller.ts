import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoadQuestionsDto } from './answer.dto';
import { AnswerQuestionnaireDto, AnswerService } from './answer.service';

@Controller('answer/:id')
export class AnswerController {
    constructor(private answerService: AnswerService){}

    @Post()
    loadQuestions(@Param('id') id: number, @Body() body: LoadQuestionsDto){
        return this.answerService.loadQuestions(id, body);
    }

    @Post('answer')
    answerQuestionnaire(@Param('id') id:number, @Body() body:  AnswerQuestionnaireDto){
        return this.answerService.answerQuestionnaire(id, body);
    }
}
