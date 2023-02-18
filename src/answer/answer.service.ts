import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoadQuestionsDto } from './answer.dto';
import { AnswerData, AnswerInsert, QuestionsMap, selectAnswerQuestion } from './answer.interface';
import * as bcrypt from 'bcrypt';
import { QuestionnaireStatus, QuestionType } from '@prisma/client';
import { parseStatus } from 'src/questionnaire/questionnaire.interface';

export interface AnswerQuestionnaireDto {
  questionnaireId: number;
  publishedQuestionnaireId: number;
  answers: Answer[];
}

export interface Answer {
  questionId: number;
  value?: string;
  options: number[];
}

export interface AnswerErrorResponse {
  status: QuestionnaireStatus | null;
  message: string;
  code: number;
}

enum ErrorMessage {
  NOT_FOUND,
  NOT_ACTIVE,
  PUBLISHED_NOT_FOUND,
}


const errorMessages: {[key: number]: {message:string, code: number}} = {
  [ErrorMessage.NOT_FOUND]: {message: "Questionnaire not found", code: 601},
  [ErrorMessage.NOT_ACTIVE]: {message: "Questionnaire is not collecting any responses at the moment", code: 602},
  [ErrorMessage.PUBLISHED_NOT_FOUND]: {message: "This published version does not exist on this questionnaire", code: 603},
};


@Injectable()
export class AnswerService {
  constructor(private prisma: PrismaService) {}

  async answerQuestionnaire(questionnaireId: number, data: AnswerQuestionnaireDto) {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: {
        id: questionnaireId,
      },
      select: {
        status: true,
        manualPublish: true,
        published: data.publishedQuestionnaireId ? {
          where: {
            id: data.publishedQuestionnaireId
          },
          select: {
            id: true,
          },
          take: 1
        } : undefined
      }
    });

    if(!questionnaire) {
      return {
        ...errorMessages[ErrorMessage.NOT_FOUND],
        status: null
      }
    }

    if(questionnaire.status !== QuestionnaireStatus.ACTIVE) {
      return {
        ...errorMessages[ErrorMessage.NOT_ACTIVE],
        status: parseStatus(questionnaire.status)
      }
    }
    
    // If we cannot find published questionnaire ID, we answer directly to latest version of questionnaire
    if((data.publishedQuestionnaireId && questionnaire.manualPublish) && (!questionnaire.published.length || questionnaire.published[0].id !== data.publishedQuestionnaireId)){
      return await this.answerAutoPublishQuestionnaire(questionnaireId, data);
    }

    // Determine whether questionnaire is auto or manual publish
    if(questionnaire.manualPublish) {
      return await this.answerManualPublishQuestionnaire(questionnaireId, data);
    }

    return await this.answerAutoPublishQuestionnaire(questionnaireId, data);
  }

  async answerAutoPublishQuestionnaire(questionnaireId: number, data: AnswerQuestionnaireDto){
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: {
        id: questionnaireId,
      },
      select: {
        id: true,
        questions: {
          select: {
            id: true,
            required: true,
            type: true,
            options: {
              select: {
                id: true,
              },
            },
          },
          where: {
            AND: [
              {
                deleted: false,
              },
              {
                visible: true,
              },
            ],
          },
        },
      }
    });

    if(!questionnaire) {
      return {
        ...errorMessages[ErrorMessage.PUBLISHED_NOT_FOUND],
        status: null,
      }
    }

    const answers = this.validateQuestions(questionnaire.questions, data.answers);

    if (!answers) {
      console.error('Did not answer to all questions');
      return 'You have to answer to all required questions';
    };

    return await this.prisma.questionnaireAnswer.create({
      data: {
        questionnaire: {
          connect: {
            id: questionnaireId,
          },
        },
        answers: {
          // We have to use create bcs create many wouldn't connect options for us
          create: answers.map((answer) => ({
            questionId: answer.questionId,
            questionnaireId: questionnaireId,
            value: answer.value,
            options: {
              connect: answer.options.map((id) => ({ id })),
            },
          })),
        },
      },
    });
  }

  validateQuestions(questions: QuestionsMap[], answers: Answer[]): AnswerInsert[]{
    const answersInsert: AnswerInsert[] = [];
    const questionsMap = new Map<number, QuestionsMap>();
    const requiredQuestions: number[] = [];


    // Generating required questions and mapping questions for faster access later on
    questions.map((question) => {
      questionsMap.set(question.id, question);

      if(question.required){
        requiredQuestions.push(question.id);
      }
    });

    //
    answers.map((answer) => {
      const question = questionsMap.get(answer.questionId);

      // Answered question doesn't exist in published questionnaire
      if (!question) {
        return;
      }

      let optionIds: number[] = [];
      let value: string | undefined = undefined;

      const allQuestionOptions = question.options.map(
        (option) => option.id,
      );

      if (
        question.type === QuestionType.SELECT &&
        answer.options.length === 1 &&
        allQuestionOptions.includes(answer.options[0])
      ) {
        optionIds = answer.options;
        value = answer.value || undefined;
      } else if (
        question.type === QuestionType.MULTI_SELECT &&
        answer.options.length >= 1 &&
        answer.options.every((id) => allQuestionOptions.includes(id))
      ) {
        optionIds = answer.options;
        value = answer.value || undefined;
      } else if (question.type === QuestionType.TEXT && answer.value) {
        value = answer.value;
      } else {
        if (question.required) {
          return;
        }
      }

      // Everything is correct
      // Inserting answer
      if (optionIds || value) {
        answersInsert.push({
          questionId: question.id,
          value,
          options: optionIds,
          required: question.required,
        });
      };
    });

    const answeredIds = answers.map((answer) => answer.questionId);

    const answeredToAllRequired = requiredQuestions.every((id) =>
      answeredIds.includes(id),
    );

    if (!answeredToAllRequired) {
      return [];
    }

    return answersInsert;
  }


  async answerManualPublishQuestionnaire(questionnaireId: number, data: AnswerQuestionnaireDto) {
    const publishedQuestionnaire = await this.prisma.publishedQuestionnaire.findUnique({
      where: {
        // Published ID is validated in the first request
        id: data.publishedQuestionnaireId
      },
      select: {
        id: true,
        questions: {
          select: {
            questionId: true,
            required: true,
            type: true,
            options: {
              select: {
                optionId: true,
              },
            },
          },
          where: {
            AND: [
              {
                deleted: false,
              },
              {
                visible: true,
              },
            ],
          },
        },
      }
    });

    if(!publishedQuestionnaire) {
      return {
        ...errorMessages[ErrorMessage.PUBLISHED_NOT_FOUND],
        status: null,
      }
    }

    const answers = this.validateQuestions(publishedQuestionnaire.questions.map((question) => ({...question, id: question.questionId, options: question.options.map((option) => ({...option, id: option.optionId}))})), data.answers);

    if(!answers){
      // TODO add error message
      return null;
    }
    
    return await this.prisma.questionnaireAnswer.create({
      data: {
        questionnaire: {
          connect: {
            id: questionnaireId,
          },
        },
        publishedQuestionnaire: {
          connect: {
            id: data.publishedQuestionnaireId,
          },
        },
        answers: {
          create: answers.map((answer) => ({
            questionId: answer.questionId,
            questionnaireId: questionnaireId,
            value: answer.value,
            options: {
              connect: answer.options.map((id) => ({ id })),
            },
          })),
        },
      },
    });
  }


  async loadQuestions(questionnaireHash: string, data: LoadQuestionsDto) {
    // First we check whether questionnaire is password protected
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: {
        url: questionnaireHash,
      },
      select: {
        id: true,
        status: true,
        passwordProtected: true,
        password: true,
        manualPublish: true,
      },
    });

    // Questionnaire does not exists, throw exception
    if (!questionnaire) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Questionnaire not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (questionnaire.status !== QuestionnaireStatus.ACTIVE) {
      throw new HttpException(
        {
          status: 469,
          error: 'Status is not active',
        },
        469,
      );
    }

    // Questionnaire has password set up
    if (questionnaire.passwordProtected) {
      // PasswordProtected is true, but there is not any hash
      if (!questionnaire.password) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Problem with database',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // User did not send any password
      if (!data.password) {
        throw new HttpException(
          {
            status: 420,
            error: 'Incorrect password',
          },
          420,
        );
      }

      // Checking user's passwords
      if (!(await bcrypt.compare(data.password, questionnaire.password))) {
        throw new HttpException(
          {
            status: 420,
            error: 'Incorrect password',
          },
          420,
        );
      }
    }

    // Checking whether questionnaire is manual or auto published
    if(!questionnaire.manualPublish) {
      const autoPublishData = await this.prisma.questionnaire.findUnique({
        where: {
          id: questionnaire.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          structure: true,
          updated: true,
          questions: {
            orderBy: {
              position: 'asc',
            },
            where: {
              AND: [
                {
                  deleted: false,
                },
                {
                  visible: true,
                }
              ]
            },
            select: {
              id: true,
              title: true,
              required: true,
              description: true,
              type: true,
              options: {
                select: {
                  id: true,
                  value: true,
                },
                orderBy: {
                  position: 'asc',
                },
                where: {
                  deleted: false,
                }
              }
            }
          }
        }
      });

      if(!autoPublishData){
        return null;
      }

      const returnData: AnswerData = {
        id: null,
        questionnaireId: questionnaire.id,
        name: autoPublishData.name,
        description: autoPublishData.description,
        structure: autoPublishData.structure,
        publishedAt: autoPublishData.updated,
        questions: autoPublishData.questions.map((question) => ({...question, publishedId: question.id, questionId: question.id,options: question.options.map((option) => ({...option, optionId: option.id}))})),
      }

      return returnData;
    } else {
      const publishedQuestionnaire =
        await this.prisma.publishedQuestionnaire.findFirst({
          where: {
            questionnaireId: questionnaire.id,
          },
          orderBy: {
            publishedAt: 'desc',
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
                    deleted: false,
                  },
                  {
                    visible: true,
                  },
                ],
              },
            },
            questionnaire: {
              select: {
                name: true,
                description: true,
                structure: true,
              },
            },
          },
        });

      if (!publishedQuestionnaire) {
        return null;
      }

      const returnData: AnswerData = {
        id: publishedQuestionnaire.id,
        questionnaireId: questionnaire.id,
        name: publishedQuestionnaire.questionnaire.name,
        description: publishedQuestionnaire.questionnaire.description,
        structure: publishedQuestionnaire.questionnaire.structure,
        publishedAt: publishedQuestionnaire.publishedAt,
        questions: publishedQuestionnaire.questions.map((question) => ({...question, publishedId: question.id, id: question.questionId})),
      }

      return returnData
    }
  }
}
