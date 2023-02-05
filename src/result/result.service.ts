import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { QuestionType } from '@prisma/client';
import { QuestionnaireStatistics, Result } from './result.interface';

dayjs.extend(customParseFormat);

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}

  async deleteAnswer(answerId: number, questionId: number): Promise<Result> {
    const question = await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        answers: {
          delete: {
            id: answerId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        required: true,
        type: true,
        answers: {
          select: {
            id: true,
            value: true,
            answeredAt: true,
            questionnaireAnswerId: true,
          },
          where: {
            value: {
              not: null,
            },
          },
          orderBy: {
            answeredAt: 'desc',
          },
        },
      },
    });

    const questionData = {
      id: question.id,
      title: question.title,
      type: question.type,
      required: question.required,
    };

    return { question: questionData, chart: null, data: question.answers };
  }

  async getAllResults(questionnaireId: number) {
    const questions = await this.prisma.question.findMany({
      where: {
        AND: [
          {
            questionnaireId,
          },
          {
            deleted: false,
          },
          {
            visible: true,
          },
        ],
      },
      select: {
        id: true,
        title: true,
        required: true,
        type: true,
        options: {
          select: {
            id: true,
            value: true,
            _count: {
              select: { answers: true },
            },
          },
          orderBy: {
            position: 'asc',
          },
          where: {
            deleted: false,
          },
        },
        answers: {
          select: {
            id: true,
            value: true,
            answeredAt: true,
            questionnaireAnswerId: true,
          },
          where: {
            value: {
              not: null,
            },
          },
          orderBy: {
            answeredAt: 'desc',
          },
        },
      },
    });

    const questionData: Result[] = questions.map((question) => {
      const questionData = {
        id: question.id,
        title: question.title,
        type: question.type,
        required: question.required,
      };

      if (question.type === QuestionType.TEXT) {
        return { question: questionData, data: question.answers, chart: null };
      }
      const labels: string[] = [];
      const data: number[] = [];

      question?.options.map((option) => {
        labels.push(option.value);
        data.push(option._count.answers);
      });

      const chart = {
        labels,
        datasets: [
          {
            label: 'Reponse count',
            data,
          },
        ],
      };
      return { question: questionData, chart, data: null };
    });
    return { questions: questionData };
  }

  async getQuestionnaireStatistics(
    id: number,
  ): Promise<QuestionnaireStatistics> {
    const result: RawStatisticsResult[] = await this.prisma
      .$queryRaw`SELECT COUNT(id), DATE(answeredAt) DateOnly from QuestionnaireAnswer  WHERE questionnaireId = ${id} GROUP BY DateOnly  ORDER BY DateOnly ASC`;

    if (!result.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const firstDate = result[0].DateOnly;
    const difference = dayjs().diff(dayjs(firstDate), 'day');

    const dates: { [key: string]: number } = {};

    for (let i = 0; i <= difference; i++) {
      dates[dayjs(firstDate).add(i, 'day').format('D. M')] = 0;
    }

    result.map((answer) => {
      const date = dayjs(answer.DateOnly).format('D. M');
      dates[date] = Number(answer['COUNT(id)'] || answer['count(id)']);
    });

    return {
      labels: Object.keys(dates),
      datasets: [
        {
          label: 'Pocet vyplneni',
          data: Object.keys(dates).map((key) => ({ x: key, y: dates[key] })),
        },
      ],
    };
  }
}

interface RawStatisticsResult {
  'COUNT(id)'?: bigint;
  'count(id)'?: bigint;
  DateOnly: Date;
}
