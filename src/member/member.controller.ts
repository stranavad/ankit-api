import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { RolesGuard } from '../roles.guard';
import { Roles } from '../roles.decorator';
import { RoleType } from '../role';
import { ApplicationMember } from './member.interface';
import { UpdateRoleDto } from './member.dto';
import { MemberId } from '../member.decorator';
import { Role } from '../role.decorator';

@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  // IMPORTANT
  // DOESN'T HAVE AUTH GUARD
  @Post()
  async createDefaultMember(@Body('userId') userId: number) {
    await this.memberService.createDefaultMember(userId);
    return;
  }
}

@Controller('space/:id/member')
export class SpaceMemberController {
  constructor(private memberService: MemberService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Put(':memberId')
  async updateMemberRole(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() body: UpdateRoleDto,
    @MemberId() currentMemberId: number,
    @Role() role: RoleType,
  ): Promise<ApplicationMember | null> {
    // Check if current member != target member or target member != owner
    if (memberId === currentMemberId) {
      return null;
    }
    const member = await this.memberService.getMemberById(memberId);

    if (!member) {
      return null;
    }

    if (member.role === RoleType.OWNER) {
      return null;
    }

    if (member.role === role) {
      return null;
    }

    return await this.memberService.updateRole(memberId, body.role);
  }
}
