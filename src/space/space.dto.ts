import { IsEmail, IsNotEmpty, IsString, IsNumber } from "class-validator";
import { RoleType } from "../role";

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

  @IsString()
  role: RoleType = RoleType.VIEW;
}

export class TransferOwnership {
  @IsNumber()
  @IsNotEmpty()
  memberId: number;
}
