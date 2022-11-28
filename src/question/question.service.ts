import { Injectable } from '@nestjs/common';
import {
  getQuestionFromPrisma,
  getQuestionsFromPrisma,
  Question,
  selectQuestion,
} from './question.interface';
import { PrismaService } from '../prisma.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from './question.dto';
import { QuestionType } from '../questionnaire/questionnaire.interface';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async loadQuestions(questionnaireId: number): Promise<Question[]> {
    const data = await this.prisma.question.findMany({
      where: {
        questionnaireId,
      },
      select: selectQuestion,
      orderBy: {
        position: 'asc',
      },
    });
    return getQuestionsFromPrisma(data);
  }

  async createQuestion(
    questionnaireId: number,
    data: CreateQuestionDto,
  ): Promise<Question[]> {
    const ids = [];
    if (data.previousId) {
      ids.push(data.previousId);
    }
    if (data.nextId) {
      ids.push(data.nextId);
    }
    // First we need to get all positions
    const questions = await this.prisma.question.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        position: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
    let position = 10;
    if (questions.length === 2) {
      // We are placing new question between two existing questions
      position = (questions[0].position + questions[1].position) / 2;
    } else if (questions.length === 1) {
      // We only have one question
      if (data.nextId) {
        // We are placing it at the first stop
        position = questions[0].position / 2;
      } else if (data.previousId) {
        position = questions[0].position + 10;
      }
    } else {
      position = 10;
    }

    const question = await this.prisma.question.create({
      data: {
        questionnaire: {
          connect: {
            id: questionnaireId,
          },
        },
        position,
        type: data.type,
        options: {
          create: {
            position: 0,
          },
        },
      },
      select: {
        questionnaire: {
          select: {
            questions: {
              select: selectQuestion,
              orderBy: {
                position: 'asc',
              },
            },
          },
        },
      },
    });

    return getQuestionsFromPrisma(question.questionnaire.questions);
  }

  checkData<ValueType>(
    value: ValueType | undefined,
    callback: (value: ValueType) => void,
  ) {
    if (typeof value !== 'undefined' && value !== null) {
      callback(value);
    }
  }

  async updateQuestion(id: number, data: UpdateQuestionDto): Promise<Question> {
    const updateQuestionData: UpdateQuestion = {};
    // Generate update data
    this.checkData(data.title, (title) => {
      updateQuestionData.title = title;
    });

    this.checkData(data.description, (description) => {
      updateQuestionData.description = description;
    });

    this.checkData(data.required, (required) => {
      updateQuestionData.required = required;
    });

    this.checkData(data.visible, (visible) => {
      updateQuestionData.visible = visible;
    });

    const question = await this.prisma.question.update({
      where: {
        id,
      },
      data: updateQuestionData,
      select: selectQuestion,
    });

    return getQuestionFromPrisma(question);
  }

  async updateQuestionType(
    id: number,
    data: UpdateQuestionTypeDto,
  ): Promise<Question | null> {
    if (data.type === data.currentType) {
      const question = await this.prisma.question.findUnique({
        where: {
          id,
        },
        select: selectQuestion,
      });
      return question ? getQuestionFromPrisma(question) : null;
    }

    if (data.currentType === QuestionType.TEXT) {
      const question = await this.prisma.question.update({
        where: {
          id,
        },
        data: {
          type: data.type,
          options: {
            create: {
              position: 10,
            },
          },
        },
        select: selectQuestion,
      });
      return getQuestionFromPrisma(question);
    }
    const question = await this.prisma.question.update({
      where: {
        id,
      },
      data: {
        type: data.type,
      },
      select: selectQuestion,
    });
    return getQuestionFromPrisma(question);
  }
}

interface UpdateQuestion {
  title?: string;
  description?: string;
  required?: boolean;
  visible?: boolean;
}
