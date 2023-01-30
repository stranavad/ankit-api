import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoadQuestionsDto } from './answer.dto';
import { AnswerQuestionnaireDto, AnswerService } from './answer.service';

@Controller('answer/:id')
export class AnswerController {
    constructor(private answerService: AnswerService){}

    @Post()
    loadQuestions(@Param('id') hash: string, @Body() body: LoadQuestionsDto){
        return this.answerService.loadQuestions(hash, body);
    }

    @Post('answer')
    answerQuestionnaire(@Param('id') id: number, @Body() body:  AnswerQuestionnaireDto){
        return this.answerService.answerQuestionnaire(id, body);
    }
}
