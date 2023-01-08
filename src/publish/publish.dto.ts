import { IsOptional, IsString } from "class-validator";

export class UpdatePublishedQuestionnaireDto {
    @IsString()
    name: string;
}