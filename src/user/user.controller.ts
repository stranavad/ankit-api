import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { UserService } from './user.service';
import { UserId } from '../user.decorator';
import { SearchUsersDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post('search')
  async searchUsers(@UserId() userId: number, @Body() body: SearchUsersDto) {
    // TODO add in and not in to userService
    return body.search.length > 2
      ? this.userService.searchUsers(userId, body.search, body.in, body.notIn)
      : [];
  }
}
