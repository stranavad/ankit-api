import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { RoleType } from '../role';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  spaceName: string;
  @IsString()
  @IsNotEmpty()
  memberName: string;
}

export class UpdateSpaceDto {
  name: string;

  description: string | null = null;
}

export class AddMemberToSpaceDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  role: RoleType = RoleType.VIEW;
}

export class TransferOwnership {
  @IsNumber()
  @IsNotEmpty()
  memberId: number;
}

export class GetUserSpaces {
  accepted = 'true';
  search: string | null = null;
}

export class UpdateSpaceMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
