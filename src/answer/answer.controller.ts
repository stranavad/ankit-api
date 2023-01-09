import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoadQuestionsDto } from './answer.dto';
import { AnswerService } from './answer.service';

@Controller('answer/:id')
export class AnswerController {
    constructor(private answerService: AnswerService){}

    @Post()
    loadQuestions(@Param('id') id: number, @Body() body: LoadQuestionsDto){
        return this.answerService.loadQuestions(id, body);
    }
}
