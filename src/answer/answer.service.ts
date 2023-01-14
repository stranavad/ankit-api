import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoadQuestionsDto } from './answer.dto';
import { selectAnswerQuestion } from './answer.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AnswerService {
    constructor(private prisma: PrismaService) {}

    async loadQuestions(questionnaireId: number, data: LoadQuestionsDto){
        // First we check whether questionnaire is password protected
        const questionnaire = await this.prisma.questionnaire.findUnique({
            where: {
                id: questionnaireId,
            },
            select: {
                passwordProtected: true,
                password: true,
            }
        })

        // Questionnaire does not exists, throw exception
        if(!questionnaire){
            throw new HttpException(
                {
                  status: HttpStatus.NOT_FOUND,
                  error: 'Questionnaire not found',
                },
                HttpStatus.NOT_FOUND,
              );
        }
        // Questionnaire has password set up
        if(questionnaire.passwordProtected){
            // PasswordProtected is true, but there is not any hash
            if(!questionnaire.password){
                throw new HttpException(
                    {
                      status: HttpStatus.INTERNAL_SERVER_ERROR,
                      error: 'Problem with database',
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );;
            }


            // User did not send any password
            if(!data.password){
                return false
                // throw new HttpException(
                //     {
                //       status: HttpStatus.FORBIDDEN,
                //       error: 'Wrong password',
                //     },
                //     HttpStatus.FORBIDDEN,
                //   );;
            }

            // Checking user's password
            if(!(await bcrypt.compare(data.password, questionnaire.password))){
                return false
                // throw new HttpException(
                //     {
                //       status: HttpStatus.FORBIDDEN,
                //       error: 'Wrong password',
                //     },
                //     HttpStatus.FORBIDDEN,
                //   );;
            }
        }


        const publishedQuestionnaire = await this.prisma.publishedQuestionnaire.findFirst({
            where: {
                questionnaireId
            },
            orderBy: {
                publishedAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                publishedAt: true,
                questions: {
                    select: selectAnswerQuestion,
                    orderBy: {
                        position: 'asc',
                    },
                    where: {
                        AND: [
                            {
                                deleted: false
                            },
                            {
                                visible: true
                            }
                        ]
                    }
                },
                questionnaire: {
                    select: {
                        name: true,
                        description: true,
                        structure: true,
                    }
                }
            }
        });


        if(!publishedQuestionnaire){
            return null;
        }

        return {
            id: publishedQuestionnaire.id,
            questionnaireId,
            name: publishedQuestionnaire.questionnaire.name,
            description: publishedQuestionnaire.questionnaire.description,
            structure: publishedQuestionnaire.questionnaire.structure,
            publishedAt: publishedQuestionnaire.publishedAt,
            questions: publishedQuestionnaire.questions,
        }
    }
}
