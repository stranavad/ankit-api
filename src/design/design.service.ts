import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Design, selectDesign } from './design.interface';
import { UpdateDesignDto } from './design.dto';

@Injectable()
export class DesignService {
  constructor(private prisma: PrismaService) {}

  async getQuestionnaireDesign(id: number): Promise<null | Design> {
    return await this.prisma.questionnaire.findUnique({
      where: {
        id,
      },
      select: selectDesign,
    });
  }

  async updateQuestionnaireDesign(
    id: number,
    data: UpdateDesignDto,
  ): Promise<Design> {
    return await this.prisma.questionnaire.update({
      where: {
        id,
      },
      data,
      select: selectDesign,
    });
  }
}
