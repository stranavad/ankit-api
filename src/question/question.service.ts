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
  UpdateOptionDto,
  UpdateOptionPositionDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from './question.dto';
import { QuestionType } from '../questionnaire/questionnaire.interface';

const positionDelta = 10;

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

  getPosition({ next }: { next: boolean }, positions: number[]): number {
    if (positions.length === 2) {
      return (positions[0] + positions[1]) / 2;
    } else if (positions.length === 1) {
      if (next) {
        return positions[0] / 2;
      }
      return positions[0] + positionDelta;
    }
    return positionDelta;
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

    const position = this.getPosition(
      { next: !!data.nextId },
      questions.map(({ position }) => position),
    );

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
            position: positionDelta,
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
              position: positionDelta,
            },
          },
        },
        select: selectQuestion,
      });
      return getQuestionFromPrisma(question);
    }
    if (data.type === QuestionType.TEXT) {
      const question = await this.prisma.question.update({
        where: {
          id,
        },
        data: {
          type: data.type,
          options: {
            deleteMany: {},
          },
        },
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

  async addOption(questionId: number, value = 'New Option') {
    // First we need to get all positions
    const options = await this.prisma.option.findFirst({
      where: {
        questionId,
      },
      select: {
        position: true,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const position = options ? options.position + 10 : 10;

    const question = await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        options: {
          create: {
            position,
            value,
          },
        },
      },
      select: selectQuestion,
    });
    return getQuestionFromPrisma(question);
  }

  async updateOption(
    optionId: number,
    data: UpdateOptionDto,
  ): Promise<Question | null> {
    const option = await this.prisma.option.update({
      where: {
        id: optionId,
      },
      data: {
        value: data.value,
      },
      select: {
        question: {
          select: selectQuestion,
        },
      },
    });

    return option ? getQuestionFromPrisma(option.question) : null;
  }

  async deleteOption(optionId: number): Promise<Question | null> {
    const option = await this.prisma.option.delete({
      where: {
        id: optionId,
      },
      select: {
        question: {
          select: selectQuestion,
        },
      },
    });
    option.question.options = option.question.options.filter(
      ({ id }) => id !== optionId,
    );
    return option ? getQuestionFromPrisma(option.question) : null;
  }

  async updateOptionPosition(
    questionId: number,
    { activeIndex, overIndex }: UpdateOptionPositionDto,
  ): Promise<Question | null> {
    const options = await this.prisma.option.findMany({
      where: {
        questionId,
      },
      select: {
        id: true,
        position: true,
      },
      orderBy: {
        position: 'asc',
      },
    });

    if (!options) {
      return null;
    }

    let firstPosition = 0;
    let secondPosition = 0;
    if (activeIndex > overIndex) {
      firstPosition = overIndex > 0 ? options[overIndex - 1].position : 0;
      secondPosition = options[overIndex].position;
    } else if (activeIndex < overIndex) {
      firstPosition = options[overIndex].position;
      secondPosition = options[overIndex + 1]
        ? options[overIndex + 1].position
        : firstPosition + 10;
    }
    const position = (firstPosition + secondPosition) / 2;
    const id = options[activeIndex].id;

    const option = await this.prisma.option.update({
      where: {
        id,
      },
      data: {
        position,
      },
      select: {
        question: {
          select: selectQuestion,
        },
      },
    });

    return getQuestionFromPrisma(option.question);
  }
}

interface UpdateQuestion {
  title?: string;
  description?: string;
  required?: boolean;
  visible?: boolean;
}
