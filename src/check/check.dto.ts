import { IsNotEmpty, IsString } from "class-validator";

export class CheckQuestionnaireUrlDto {
    @IsString()
    @IsNotEmpty()
    url: string;
}