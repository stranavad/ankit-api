import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Status, Structure } from './questionnaire.interface';

export class CreateQuestionnaireDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  spaceId: number;
}

export class UpdateQuestionnaireDto {
  @IsString()
  name: string | null = null;
  @IsString()
  description: string | null = null;
  @IsEnum(Structure)
  structure: Structure | null = null;
  @IsNumber()
  category: number | null = null;
  @IsEnum(Status)
  status: Status | null = null;
  @IsNumber()
  timeLimit: number | null = null;
  @IsBoolean()
  allowReturn: boolean | null = null;
  @IsBoolean()
  passwordProtected: boolean | null = null;
  @IsString()
  password: string | null = null;
}
