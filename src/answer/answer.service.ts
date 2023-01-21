import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoadQuestionsDto } from './answer.dto';
import { selectAnswerQuestion } from './answer.interface';
import * as bcrypt from 'bcrypt';
import { QuestionType } from '@prisma/client';

export interface AnswerQuestionnaireDto {
    questionnaireId: number;
    publishedQuestionnaireId: number;
    answers: Answer[] 
}


export interface Answer {
    questionId: number;
    value?: string;
    options: number[];
}


@Injectable()
export class AnswerService {
    constructor(private prisma: PrismaService) {}

    async answerQuestionnaire(questionnaireId: number, data: AnswerQuestionnaireDto): Promise<any>{
        // First we select questionnaire, so that we can check validity of user's responses
        const questionnaire = await this.prisma.questionnaire.findUnique({
            where: {
                id: questionnaireId
            },
            select: {
                published: {
                    select: {
                        id: true,
                        questions: {
                            select: {
                                questionId: true,
                                required: true,
                                type: true,
                                options: {
                                    select: {
                                        optionId: true
                                    }
                                }
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
                        }
                    },
                    where: {
                        id: data.publishedQuestionnaireId
                    }
                },
            }
        });

        if(!questionnaire || !questionnaire.published[0]){
            return null;
        }

        const publishedQuestionnaire = questionnaire.published[0];

        const answers: {questionId: number, value: string | undefined, options: number[], required: boolean}[] = [];

        const questionsMap = new Map<number, {
            questionId: number;
            required: boolean;
            type: QuestionType;
            options: {
                optionId: number;
            }[]}>();

        const requiredQuestions: number[] = [];    

        // User is answering directly to published questionnaire
        // Which means that we can use more advanced answer validation
        publishedQuestionnaire.questions.map((question) => {
            questionsMap.set(question.questionId, question);
            if(question.required){
                requiredQuestions.push(question.questionId);
            }
        });

        // Validation
        data.answers.forEach((answer) => {
            const question = questionsMap.get(answer.questionId);

            // Answered question doesn't exist in published questionnaire
            if(!question){
                return;
            }

            let optionIds: number[] = [];
            let value: string | undefined = undefined;
            const allQuestionOptions = question.options.map((option) => option.optionId);

            if(question.type === QuestionType.SELECT && answer.options.length === 1 && allQuestionOptions.includes(answer.options[0])){
                optionIds = answer.options;
                value = answer.value || undefined
            } else if (question.type === QuestionType.MULTI_SELECT && answer.options.length >= 1 && answer.options.every((id) => allQuestionOptions.includes(id))){
                optionIds = answer.options;
                value = answer.value || undefined
            } else if (question.type === QuestionType.TEXT && answer.value){
                value = answer.value;
            } else {
                if(question.required){
                    return;
                }
            }

            // Everything is correct
            // Inserting answer
            if(optionIds || value){
                answers.push({
                    questionId: question.questionId,
                    value,
                    options: optionIds,
                    required: question.required
                })
            }

        });

        const answeredIds = answers.map((answer) => answer.questionId);

        const answeredToAllRequired = requiredQuestions.every((id) => answeredIds.includes(id))

        if(!answeredToAllRequired){
            console.error("Did not answer to all questions");
            return "You have to answer to all required questions";
        }

        const response = await this.prisma.questionnaireAnswer.create({
            data: {
                questionnaire: {
                    connect: {
                        id: questionnaireId
                    }
                },
                publishedQuestionnaire: {
                    connect: {
                        id: data.publishedQuestionnaireId
                    }
                },
                answers: {
                    // We have to use create bcs create many wouldn't connect options for us
                    create: answers.map((answer) => ({
                        questionId: answer.questionId,
                        questionnaireId,
                        value: answer.value,
                        options: {
                            connect: answer.options.map((id) => ({id}))
                        }
                    }))
                }
            },
        })

        return response;
    }

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
