import { Injectable } from '@nestjs/common';
import { stringify } from 'querystring';
import { PrismaService } from 'src/prisma.service';
import { UpdatePublishedQuestionnaireDto } from './publish.dto';
import { PublishedQuestionnaire, selectPublishedQuestionnaire } from './publish.interface';

const currentVersion = "v0.0.1"

@Injectable()
export class PublishService {
    constructor(private prisma: PrismaService) {}

    async loadPublishedQuestionnaires(questionnaireId: number): Promise<PublishedQuestionnaire[]>{
        const backups = await this.prisma.publishedQuestionnaire.findMany({
            where: {questionnaireId},
            select: selectPublishedQuestionnaire,
            orderBy: {
                publishedAt: 'desc',
            }
        })
        return backups;
    }

    async updatePublishedQuestionnaire(id: number, data: UpdatePublishedQuestionnaireDto): Promise<PublishedQuestionnaire>{
        const updatedBackup = await this.prisma.publishedQuestionnaire.update({
            where: {
                id,
            },
            data,
            select: selectPublishedQuestionnaire,
        })

        return updatedBackup;
    }

    async getPublishedQuestionnaire(id: number){
        const publishedQuestionnaire = await this.prisma.publishedQuestionnaire.findUnique({
            where: {
                id
            },
            select: {
                data: true
            }
        });

        return publishedQuestionnaire?.data;
    }

    async deletePublishedQuestionnaire(id: number): Promise<boolean>{
        await this.prisma.publishedQuestionnaire.delete({
            where: {
                id
            }
        });
        return true;
    }

    async publishQuestionnaire(questionnaireId: number, memberId: number, data: UpdatePublishedQuestionnaireDto){
        const questionnaire = await this.prisma.questionnaire.findUnique({
            where: {
                id: questionnaireId
            },
            select: {
                name: true,
                description: true,
                structure: true,
                questions: {
                    where: {
                        AND: [
                            {
                                deleted: false,
                            },
                            {
                                visible: true
                            }
                        ]
                    },
                    orderBy: {
                        position: 'asc',
                    },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        required: true,
                        type: true,
                        options: {
                            orderBy: {
                                position: 'asc'
                            },
                            select: {
                                id: true,
                                value: true
                            }
                        }
                    },
                },
            }
        })

        const publishedQuestionnaire = await this.prisma.publishedQuestionnaire.create({
            data: {
                name: data.name,
                version: currentVersion,
                data: questionnaire || {},
                publisher: {
                    connect: {
                        id: memberId
                    }
                },
                questionnaire: {
                    connect: {
                        id: questionnaireId
                    }
                }
            }
        })
        return publishedQuestionnaire;
    }
}
