import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RoleType } from '../role';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  spaceName: string;
  @IsString()
  @IsNotEmpty()
  memberName: string;
}

export class AddMemberToSpaceDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  role: RoleType;
}
