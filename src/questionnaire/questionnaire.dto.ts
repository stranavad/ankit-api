import { QuestionnaireStatus, QuestionnaireStructure } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuestionnaireDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateQuestionnaireDto {
  // @IsString()
  name?: string | null = null;
  // @IsString()
  description?: string | null = null;
  @IsEnum(QuestionnaireStructure)
  @IsOptional()
  structure?: QuestionnaireStructure | string | null = null;
  // @IsNumber()
  category?: number | null = null;
  @IsEnum(QuestionnaireStatus)
  @IsOptional()
  status?: QuestionnaireStatus | string | null = null;
  // @IsNumber()
  timeLimit?: number | null = null;
  // @IsBoolean()
  allowReturn?: boolean | null = null;
  // @IsBoolean()
  passwordProtected?: boolean | null = null;
  // @IsString()
  password?: string | null = null;
}
