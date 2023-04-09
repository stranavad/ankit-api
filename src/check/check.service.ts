import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CheckService {
  constructor(private prisma: PrismaService) {}

  async checkQuestionnaireUrl(url: string): Promise<boolean> {
    const result = await this.prisma.questionnaire.findUnique({
      where: {
        url,
      },
      select: {
        id: true,
      },
    });

    return !!result;
  }
}
