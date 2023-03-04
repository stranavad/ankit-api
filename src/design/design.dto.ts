import { IsOptional, IsString } from "class-validator";

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
    buttonColor?: string;

    @IsString()
    @IsOptional()
    buttonTextColor?: string;

    @IsString()
    @IsOptional()
    textColor?: string;

    @IsString()
    @IsOptional()
    optionSelectedColor?: string;
}