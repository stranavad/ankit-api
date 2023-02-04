import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdatePublishedQuestionnaireDto } from './publish.dto';
import * as dayjs from 'dayjs';
import {
  QuestionToPublish,
  selectPublishedQuestionnaire,
  selectQuestionsToPublish,
} from './publish.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PublishService {
  constructor(private prisma: PrismaService) {}

  async updatePublishedQuestionnaire(
    publishedId: number,
    body: UpdatePublishedQuestionnaireDto,
  ) {
    const updateData = { name: body.name };
    return await this.prisma.publishedQuestionnaire.update({
      where: {
        id: publishedId,
      },
      data: updateData,
      select: selectPublishedQuestionnaire,
    });
  }

  async checkIsQuestionnairePublished(
    questionnaireId: number,
  ): Promise<boolean> {
    const questionnaire = await this.prisma.publishedQuestionnaire.findFirst({
      where: { questionnaireId },
      select: {
        id: true,
      },
    });
    return !!questionnaire;
  }

  async checkQuestionnairePublish(
    questionnaireId: number,
  ): Promise<{ lastPublished: Date | null; canPublish: boolean }> {
    const questionnaire = await this.prisma.publishedQuestionnaire.findFirst({
      where: {
        questionnaireId,
      },
      select: {
        publishedAt: true,
        questionnaire: {
          select: {
            questions: {
              select: {
                updated: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    if (!questionnaire) {
      return { lastPublished: null, canPublish: true };
    }

    let canPublish = false;
    const BreakException = {};

    try {
      questionnaire.questionnaire.questions.forEach((question) => {
        if (dayjs(question.updated).isAfter(questionnaire.publishedAt)) {
          canPublish = true;
          throw BreakException;
        }
      });
    } catch (e) {
      if (e !== BreakException) {
        throw e;
      }
    }

    return { lastPublished: questionnaire.publishedAt, canPublish };
  }

  async getPublishedQuestionnaire(publishedId: number) {
    return await this.prisma.publishedQuestionnaire.findUnique({
      where: {
        id: publishedId,
      },
      select: selectPublishedQuestionnaire,
    });
  }

  async loadPublishedQuestionnaires(questionnaireId: number) {
    return await this.prisma.publishedQuestionnaire.findMany({
      where: {
        questionnaireId,
      },
      select: selectPublishedQuestionnaire,
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  async deletePublishedQuestionnaire(publishedId: number) {
    const deletedQuestionnaire =
      await this.prisma.publishedQuestionnaire.delete({
        where: {
          id: publishedId,
        },
        select: {
          questions: {
            select: {
              id: true,
              publishedQuestionnaires: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

    // Delete questions that are no longer used
    const deleteQuestionIds: number[] = deletedQuestionnaire.questions
      .filter((question) => !question.publishedQuestionnaires.length)
      .map(({ id }) => id);

    if (!deleteQuestionIds.length) {
      return true;
    }

    await this.prisma.publishedQuestion.deleteMany({
      where: {
        id: {
          in: deleteQuestionIds,
        },
      },
    });
  }

  async publishQuestionnaire(
    questionnaireId: number,
    memberId: number,
    data: UpdatePublishedQuestionnaireDto,
  ) {
    const lastPublish = await this.prisma.publishedQuestionnaire.findFirst({
      where: {
        questionnaireId,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      select: {
        id: true,
        publishedAt: true,
        questions: {
          select: {
            id: true,
            questionId: true,
            publishedAt: true,
          },
        },
        questionnaire: {
          select: {
            questions: {
              select: selectQuestionsToPublish,
            },
          },
        },
      },
    });

    const connectQuestionsIds: number[] = [];
    let createQuestions: QuestionToPublish[] = [];

    // Checking whether this is the user's first publish
    if (lastPublish) {
      const matchedQuestionsMap = new Map<
        number,
        { id: number; publishedAt: Date; questionId: number }
      >();
      lastPublish?.questions.map((question) =>
        matchedQuestionsMap.set(question.questionId, question),
      );

      lastPublish?.questionnaire.questions.map((question) => {
        const mappedQuestion = matchedQuestionsMap.get(question.id);

        if (
          !mappedQuestion ||
          dayjs(question.updated).isAfter(mappedQuestion.publishedAt)
        ) {
          createQuestions.push(question);
          return;
        }

        connectQuestionsIds.push(mappedQuestion.id);
      });
    } else {
      const questionnaire = await this.prisma.questionnaire.findUnique({
        where: {
          id: questionnaireId,
        },
        select: {
          questions: {
            select: selectQuestionsToPublish,
          },
        },
      });

      createQuestions = questionnaire?.questions || [];
    }

    const publishedQuestionnaireData =
      Prisma.validator<Prisma.PublishedQuestionnaireCreateArgs>()({
        data: {
          name: data.name,
          questionnaire: {
            connect: {
              id: questionnaireId,
            },
          },
          publisher: {
            connect: {
              id: memberId,
            },
          },
          questions: {
            connect: connectQuestionsIds.map((id) => ({ id: id })),
            create: createQuestions.map((question) => {
              const movedOptions = question.options.map((option, index) => ({
                option: {
                  connect: {
                    id: option.id,
                  },
                },
                value: option.value,
                position: index * 10,
                deleted: option.deleted,
              }));

              return {
                title: question.title,
                description: question.description,
                visible: question.visible,
                required: question.required,
                deleted: question.deleted,
                position: question.position,
                type: question.type,
                questionnaire: {
                  connect: {
                    id: questionnaireId,
                  },
                },
                question: {
                  connect: {
                    id: question.id,
                  },
                },
                options: {
                  create: movedOptions,
                },
              };
            }),
          },
        },
        select: {
          id: true,
        },
      });

    return await this.prisma.publishedQuestionnaire.create(
      publishedQuestionnaireData,
    );
  }
}
