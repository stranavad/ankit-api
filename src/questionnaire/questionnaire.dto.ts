import { QuestionnaireStatus, QuestionnaireStructure } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuestionnaireDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateQuestionnaireDto {
  @IsString()
  @IsOptional()
  name?: string | null = null;
  @IsString()
  @IsOptional()
  description?: string | null = null;
  @IsEnum(QuestionnaireStructure)
  @IsOptional()
  structure?: QuestionnaireStructure | string | null = null;
  // @IsNumber()
  category?: number | null = null;

  @IsEnum(QuestionnaireStatus)
  @IsOptional()
  status?: QuestionnaireStatus | string | null = null;
  @IsNumber()
  @IsOptional()
  timeLimit?: number | null = null;
  @IsBoolean()
  @IsOptional()
  allowReturn?: boolean | null = null;
  @IsBoolean()
  @IsOptional()
  manualPublish?: boolean | null = null;
  @IsBoolean()
  @IsOptional()
  passwordProtected?: boolean | null = null;
  password?: string | null = null;

  @IsOptional()
  @IsString()
  url?: string | null = null;
}
