import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUsersDto {
  @IsString()
  @IsNotEmpty()
  search: string;

  in: number[] = [];
  notIn: number[] = [];
}
