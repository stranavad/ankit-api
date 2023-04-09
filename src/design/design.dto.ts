import { IsOptional, IsString } from 'class-validator';

export class UpdateDesignDto {
  @IsString()
  @IsOptional()
  font?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  logoPlacement?: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsString()
  @IsOptional()
  optionSelectedColor?: string;

  @IsString()
  @IsOptional()
  optionSelectedText?: string;

  @IsString()
  @IsOptional()
  optionColor?: string;

  @IsString()
  @IsOptional()
  optionText?: string;

  @IsString()
  @IsOptional()
  buttonColor?: string;

  @IsString()
  @IsOptional()
  buttonText?: string;

  @IsString()
  @IsOptional()
  textColor?: string;
}
