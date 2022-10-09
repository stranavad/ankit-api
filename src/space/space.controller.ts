import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AccountId } from '../account.decorator';
import { MemberService } from '../member/member.service';
import { AddMemberToSpaceDto, CreateSpaceDto } from './space.dto';
import { AccountService } from '../account/account.service';
import { RoleType } from '../role';
import { SpaceService } from './space.service';
import { ApplicationSpace } from './space.interface';

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

  @Post('addmember')
  async addMemberToSpace(
    @AccountId() accountId: string,
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
      body.spaceId,
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
      spaceId: body.spaceId,
      accountId: account.id,
      role: RoleType.VIEW,
      name: account.name,
    });
  }
}
