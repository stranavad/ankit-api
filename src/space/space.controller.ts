import {
  Body,
  Controller,
  Get,
  Delete,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AccountId } from '../account.decorator';
import { MemberService } from '../member/member.service';
import { AddMemberToSpaceDto, CreateSpaceDto } from './space.dto';
import { AccountService } from '../account/account.service';
import { SpaceService } from './space.service';
import { ApplicationSpace } from './space.interface';
import { RolesGuard } from '../roles.guard';
import { Roles } from '../roles.decorator';

@Controller('space')
@UseGuards(AuthGuard)
export class SpaceController {
  constructor(
    private memberService: MemberService,
    private accountService: AccountService,
    private spaceService: SpaceService,
  ) {}

  @Get()
  async getUserSpaces(
    @AccountId() accountId: string,
  ): Promise<ApplicationSpace[] | null> {
    const members = await this.memberService.getAllMembersWithSpaces(accountId);
    if (!members) {
      return null;
    }
    return this.spaceService.mergeSpaces(members);
  }

  @Post()
  async createSpace(
    @AccountId() accountId: string,
    @Body() body: CreateSpaceDto,
  ): Promise<ApplicationSpace> {
    const data = {
      accountId,
      spaceName: body.spaceName,
      memberName: body.memberName,
    };
    return await this.spaceService.createSpace(data);
  }

  @Get('members')
  async getSpaceMembers(@Query('spaceId') spaceId: number) {
    return this.spaceService.getMembers(spaceId);
  }

  @Post(':id/member')
  async addMemberToSpace(
    @AccountId() accountId: string,
    @Param('id') spaceId: number,
    @Body() body: AddMemberToSpaceDto,
  ) {
    const account = await this.accountService.findAccountByEmail(body.email);
    if (!account) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `User '${body.email}' does not exist`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // Check if user is in group already
    const inSpace = await this.memberService.isMemberInSpace(
      account.id,
      spaceId,
    );

    if (inSpace) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `User '${body.email}' is already in this space`,
        },
        HttpStatus.BAD_REQUEST,
      );
      return;
    }

    return await this.spaceService.addMemberToSpace({
      spaceId: spaceId,
      accountId: account.id,
      role: body.role,
      name: account.name,
    });
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id/member')
  removeMemberFromSpace(
    @AccountId() accountId: string,
    @Body('memberId') memberId: number,
    @Param('id') spaceId: number,
  ) {
    return 'something';
  }
}
