import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUsersDto {
  @IsString()
  search = '';

  in: number[] = [];
  notIn: number[] = [];
}
