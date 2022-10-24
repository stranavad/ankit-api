import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { MemberService } from '../member/member.service';
import {
  CreateSpaceDto,
  GetUserSpaces,
  UpdateSpaceDto,
  UpdateSpaceMemberDto,
} from './space.dto';
import { AccountService } from '../account/account.service';
import { SpaceService } from './space.service';
import { ApplicationSpace, UpdateSpaceData } from './space.interface';
import { RolesGuard } from '../roles.guard';
import { Roles } from '../roles.decorator';
import { RoleType } from '../role';
import { MemberId } from '../member.decorator';
import { UserId } from '../user.decorator';
import { SpaceId } from '../space.decorator';

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
    @UserId() userId: number,
    @Query() query: GetUserSpaces,
  ): Promise<ApplicationSpace[] | null> {
    const filter = {
      accepted: query.accepted,
      search: query.search,
    };
    return await this.memberService.getAllMembersWithSpaces(userId, filter);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createSpace(
    @UserId() userId: number,
    @Body() body: CreateSpaceDto,
  ): Promise<ApplicationSpace> {
    const data = {
      userId,
      spaceName: body.spaceName,
      memberName: body.memberName,
    };
    return await this.spaceService.createSpace(data);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Put(':id')
  async updateSpace(
    @SpaceId() spaceId: number,
    @Body() data: UpdateSpaceDto,
    @MemberId() memberId: number,
  ): Promise<ApplicationSpace | null> {
    const updateData: UpdateSpaceData = {};

    if (data.name) {
      updateData['name'] = data.name;
    }
    if (data.description) {
      updateData['description'] = data.description;
    }

    return this.spaceService.updateSpace(updateData, spaceId, memberId);
  }

  @UseGuards(AuthGuard)
  @Put(':id/member')
  async updateSpaceUsername(
    @Param('id', ParseIntPipe) spaceId: number,
    @UserId() userId: number,
    @Body() data: UpdateSpaceMemberDto,
  ) {
    return this.spaceService.updateSpaceMember(data, spaceId, userId);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.VIEW)
  @Get(':id')
  getSpaceById(@SpaceId() spaceId: number) {
    return this.spaceService.getDetailsSpaceById(spaceId);
  }

  // @UseGuards(AuthGuard)
  // @Get(':id/member')
  // async getSpaceMembers(@Param('id', ParseIntPipe) spaceId: number) {
  //   // TODO add check if user in in space - one query possible
  //   return this.spaceService.getMembers(spaceId);
  // }

  // @UseGuards(RolesGuard)
  // @Roles(RoleType.ADMIN)
  // @Post(':id/member')
  // async addMemberToSpace(
  //   @UserId() userId: number,
  //   @Param('id', ParseIntPipe) spaceId: number,
  //   @Body() body: AddMemberToSpaceDto,
  // ) {
  //   const user = await this.userService.findUserByEmail(body.email);
  //   if (!user) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         error: `User '${body.email}' does not exist`,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   // Check if user is in group already
  //   const inSpace = await this.userService.isUserInSpace(user.id, spaceId);
  //
  //   if (inSpace) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         error: `User '${body.email}' is already in this space`,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //
  //   return await this.spaceService.addMemberToSpace({
  //     spaceId: spaceId,
  //     userId: user.id,
  //     role: body.role,
  //     name: user.name,
  //   });
  // }
  @UseGuards(RolesGuard)
  @Roles(RoleType.OWNER)
  @Delete(':id')
  async deleteSpace(@Param('id', ParseIntPipe) spaceId: number) {
    await this.spaceService.deleteSpace(spaceId);
    return 'deleted';
  }

  // @UseGuards(RolesGuard)
  // @Roles('owner')
  // @Post(':id/transfer-ownership')
  // async transferSpaceOwnerShip(
  //   @Param('id', ParseIntPipe) spaceId: number,
  //   @Body() body: TransferOwnership,
  //   @MemberId() ownerId: number,
  // ) {
  //   const { memberId } = body;
  //   // Check if member is inspace
  //   const isInSpace = await this.memberService.isMemberInSpace(
  //     memberId,
  //     spaceId,
  //   );
  //
  //   if (!isInSpace) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         error: `Member '${memberId}' does not exist or is not in this space`,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   await this.memberService.updateRole(memberId, RoleType.OWNER);
  //   await this.memberService.updateRole(ownerId, RoleType.ADMIN);
  //   return this.spaceService.transferOwnership(memberId, ownerId, spaceId);
  // }

  // @UseGuards(RolesGuard)
  // @Roles('admin')
  // @Delete(':id/member/:memberId')
  // async removeMemberFromSpace(
  //   @AccountId() accountId: string,
  //   @Param('id') spaceId: number,
  //   @Param('memberId', ParseIntPipe) memberId: number,
  //   @Role() role: RoleType,
  // ) {
  //   const memberRole = await this.memberService.getMemberRole(memberId);
  //   if (!memberRole) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         error: `Member '${memberId}' does not exist`,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   if (
  //     [RoleType.VIEW, RoleType.EDIT].includes(memberRole) ||
  //     role === RoleType.OWNER
  //   ) {
  //     await this.memberService.deleteMember(memberId);
  //   } else {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.FORBIDDEN,
  //         error: `You do not have enough permissions`,
  //       },
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  //   // check role hierarchy
  //   return 'Successfully deleted';
  // }
}
