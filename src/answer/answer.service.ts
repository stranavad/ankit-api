import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoadQuestionsDto } from './answer.dto';

@Injectable()
export class AnswerService {
    constructor(private prisma: PrismaService) {}

    async loadQuestions(questionnaireId: number, data: LoadQuestionsDto){
        const publishedQuestionnaire = await this.prisma.publishedQuestionnaire.findFirst({
            where: {
                questionnaireId
            },
            orderBy: {
                publishedAt: 'desc'
            },
            select: {
                id: true,
                publishedAt: true,
                data: true,
                questionnaire: {
                    select: {
                        name: true,
                        description: true,
                        passwordProtected: true,
                        password: true,
                    }
                }
            }
        });

        if(!publishedQuestionnaire){
            return null;
        }

        if(publishedQuestionnaire.questionnaire.passwordProtected){
            if(publishedQuestionnaire.questionnaire.password !== data.password){
                throw new HttpException(
                    {
                      status: HttpStatus.FORBIDDEN,
                      error: 'Wrong password',
                    },
                    HttpStatus.FORBIDDEN,
                  );
            }
        }

        return {
            id: publishedQuestionnaire.id,
            questionnaireId,
            name: publishedQuestionnaire.questionnaire.name,
            description: publishedQuestionnaire.questionnaire.description,
            publishedAt: publishedQuestionnaire.publishedAt,
            data: publishedQuestionnaire.data,
        }
    }
}
