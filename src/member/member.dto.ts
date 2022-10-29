import { IsNotEmpty } from 'class-validator';
import { RoleType } from '../role';

export class UpdateMemberDto {
  name: string | null = null;
}

export class UpdateRoleDto {
  @IsNotEmpty()
  role: RoleType;
}
