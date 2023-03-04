import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Design, selectDesign } from './design.interface';
import { UpdateDesignDto } from './design.dto';

@Injectable()
export class DesignService {
    constructor(private prisma: PrismaService){}

    async getQuestionnaireDesign(questionnaireId: number): Promise<null | Design> {
        return await this.prisma.questionnaireDesign.findUnique({
            where: {
                questionnaireId
            },
            select: selectDesign
        });
    }

    async updateQuestionnaireDesign(questionnaireId: number, data: UpdateDesignDto): Promise<Design> {
        return await this.prisma.questionnaireDesign.update({
            where: {
                questionnaireId
            },
            data,
            select: selectDesign
        });
    }
}
