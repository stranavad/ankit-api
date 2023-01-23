import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ResultService {
    constructor(private prisma: PrismaService){
    }

    async getAllResults(questionnaireId: number){
        const questionnaire = await this.prisma.questionnaire.findUnique({
            where: {
                id: questionnaireId,
            },
            select: {
                questions: {
                    select: {
                        title: true,
                        answers: {
                            select: {
                                questionnaireAnswerId: true,
                                value: true,
                                options: {
                                    select: {
                                        id: true,
                                        value: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        return questionnaire;
    }
}
