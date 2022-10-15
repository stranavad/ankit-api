import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AccountId } from '../account.decorator';
import { MemberService } from '../member/member.service';
import {
  AddMemberToSpaceDto,
  CreateSpaceDto,
  TransferOwnership,
} from './space.dto';
import { AccountService } from '../account/account.service';
import { SpaceService } from './space.service';
import { ApplicationSpace } from './space.interface';
import { RolesGuard } from '../roles.guard';
import { Roles } from '../roles.decorator';
import { RoleType } from '../role';
import { MemberId } from '../member.decorator';
import { Role } from '../role.decorator';

@Controller('space')
export class SpaceController {
  constructor(
    private memberService: MemberService,
    private accountService: AccountService,
    private spaceService: SpaceService,
  ) {}

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Get(':id/member')
  async getSpaceMembers(@Param('id', ParseIntPipe) spaceId: number) {
    return this.spaceService.getMembers(spaceId);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Post(':id/member')
  async addMemberToSpace(
    @AccountId() accountId: string,
    @Param('id', ParseIntPipe) spaceId: number,
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
    const inSpace = await this.memberService.isAccountInSpace(
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
    }

    return await this.spaceService.addMemberToSpace({
      spaceId: spaceId,
      accountId: account.id,
      role: body.role,
      name: account.name,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.OWNER)
  @Delete(':id')
  async deleteSpace(@Param('id', ParseIntPipe) spaceId: number) {
    await this.spaceService.deleteSpace(spaceId);
    return 'deleted';
  }

  @UseGuards(RolesGuard)
  @Roles('owner')
  @Post(':id/transfer-ownership')
  async transferSpaceOwnerShip(
    @Param('id', ParseIntPipe) spaceId: number,
    @Body() body: TransferOwnership,
    @MemberId() ownerId: number,
  ) {
    const { memberId } = body;
    // Check if member is inspace
    const isInSpace = await this.memberService.isMemberInSpace(
      memberId,
      spaceId,
    );

    if (!isInSpace) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Member '${memberId}' does not exist or is not in this space`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.memberService.updateRole(memberId, RoleType.OWNER);
    await this.memberService.updateRole(ownerId, RoleType.ADMIN);
    return this.spaceService.transferOwnership(memberId, ownerId, spaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id/member/:memberId')
  async removeMemberFromSpace(
    @AccountId() accountId: string,
    @Param('id') spaceId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Role() role: RoleType,
  ) {
    const memberRole = await this.memberService.getMemberRole(memberId);
    if (!memberRole) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Member '${memberId}' does not exist`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      [RoleType.VIEW, RoleType.EDIT].includes(memberRole) ||
      role === RoleType.OWNER
    ) {
      await this.memberService.deleteMember(memberId);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: `You do not have enough permissions`,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    // check role hierarchy
    return 'Successfully deleted';
  }
}
