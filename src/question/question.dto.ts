import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { QuestionType } from '../questionnaire/questionnaire.interface';

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;
  previousId: number | null = null;
  nextId: number | null = null;
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  title: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsBoolean()
  @IsOptional()
  required: boolean;
  @IsBoolean()
  @IsOptional()
  visible: boolean;
}

export class UpdateQuestionTypeDto {
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;
  @IsEnum(QuestionType)
  @IsNotEmpty()
  currentType: QuestionType;
}

export class AddOptionDto {
  value: string;
}

export class UpdatePositionDto {
  @IsNotEmpty()
  @IsNumber()
  overIndex: number;
  @IsNotEmpty()
  @IsNumber()
  activeIndex: number;
}

export class UpdateOptionDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}
