import { IsDate, IsEnum, IsOptional } from "class-validator";

export enum StatisticsType {
    ANSWER = 'ANSWER',
}

export class GetQuestionnaireStatistics {
    @IsEnum(StatisticsType)
    type: StatisticsType = StatisticsType.ANSWER;

    @IsOptional()
    @IsDate()
    from: Date | null = null;

    @IsOptional()
    @IsDate()
    to: Date | null = null;
}