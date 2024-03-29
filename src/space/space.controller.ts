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
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { MemberService } from '../member/member.service';
import {
  AddMemberToSpaceDto,
  CreateSpaceDto,
  UpdateSpaceDto,
  UpdateSpaceMemberDto,
} from './space.dto';
import { SpaceService } from './space.service';
import {
  ApplicationSpace,
  DetailSpace,
  UpdateSpaceData,
} from './space.interface';
import { RolesGuard } from '../roles.guard';
import { Roles } from '../roles.decorator';
import { RoleType } from '../role';
import { MemberId } from '../member.decorator';
import { UserId } from '../user.decorator';
import { SpaceId } from '../space.decorator';
import { AcceptSpaceInvitationDto } from '../member/member.dto';
import { Role } from '../role.decorator';

@Controller('spaces')
export class SpaceController {
  constructor(
    private memberService: MemberService,
    private spaceService: SpaceService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getUserSpaces(
    @UserId() userId: number,
  ): Promise<ApplicationSpace[] | null> {
    return await this.memberService.getAllMembersWithSpaces(userId);
  }

  @Get('picker')
  @UseGuards(AuthGuard)
  async getPickerSpaces(@UserId() userId: number){
    return await this.spaceService.getPickerSpaces(userId);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.VIEW)
  @Post(':id/accept')
  async acceptSpaceInvitation(
    @MemberId() memberId: number,
    @Body() acceptSpaceInvitation: AcceptSpaceInvitationDto,
    @Role() role: RoleType,
  ) {
    if (acceptSpaceInvitation.accept) {
      return this.memberService.acceptInvitation(memberId);
    }

    if (role === RoleType.OWNER) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'You cannot leave space as owner',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.memberService.leaveSpace(memberId);
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
  ): Promise<DetailSpace | null> {
    const updateData: UpdateSpaceData = {};

    if (data.name) {
      updateData['name'] = data.name;
    }
    if (data.description) {
      updateData['description'] = data.description;
    }

    return this.spaceService.updateSpace(updateData, spaceId);
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

  @UseGuards(RolesGuard)
  @Roles(RoleType.VIEW)
  @Get(':id/current')
  getCurrentSpaceDetails(
    @SpaceId() spaceId: number,
    @MemberId() memberId: number,
  ) {
    return this.spaceService.getCurrentSpace(spaceId, memberId);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.VIEW)
  @Get(':id/member')
  async getSpaceMembers(@Param('id', ParseIntPipe) spaceId: number) {
    return this.spaceService.getMembers(spaceId);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Post(':id/member')
  async addMemberToSpace(
    @SpaceId() spaceId: number,
    @Body() body: AddMemberToSpaceDto,
  ) {
    return await this.spaceService.addMemberToSpace({
      spaceId,
      userId: body.userId,
      role: body.role,
      name: body.username,
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
  @Roles(RoleType.VIEW)
  @Post(':id/leave')
  async leaveSpace(@MemberId() memberId: number, @Role() role: RoleType) {
    if (role === RoleType.OWNER) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'You are the owner you gay',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.spaceService.leaveSpace(memberId);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.OWNER)
  @Delete(':id/member/:memberId')
  async removeMemberFromSpace(
    @SpaceId() spaceId: number,
    @UserId() userId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    await this.memberService.deleteMember(memberId, userId);
    return this.spaceService.getMembers(spaceId);
  }
}
