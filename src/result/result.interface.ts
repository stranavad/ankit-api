import { Question } from "@prisma/client";

export interface ChartData {
    labels: string[] | number[];
    datasets: {
        label: string;
        data: number[] | string[] | {x: string | number, y: string | number}
    }[]
}

export interface ResultQuestionAnswer {
    id: number;
    questionnaireAnswerId: number;
    value: string | null;
    answeredAt: Date;
}

export interface Result {
    question: Pick<Question, 'id' | 'title' | 'required' | 'type'>;
    data: ResultQuestionAnswer[] | null
    chart: ChartData | null;
}

export interface QuestionnaireStatistics {
    labels: string[];
    datasets: {
        label: string;
        data: {x: string, y: number}[]
    }[]
}