import { IsOptional, IsString } from 'class-validator';

export class LoadQuestionsDto {
  @IsString()
  @IsOptional()
  password?: string;
}
