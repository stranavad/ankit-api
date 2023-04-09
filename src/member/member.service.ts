import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApplicationSpace, selectSimpleSpace } from '../space/space.interface';
import {
  ApplicationMember,
  getApplicationMemberFromPrismaApplicationMember,
  selectApplicationMember,
} from './member.interface';
import { parseRole, RoleType } from '../role';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async getMemberById(id: number): Promise<ApplicationMember | null> {
    const member = await this.prisma.member.findUnique({
      where: {
        id,
      },
      select: selectApplicationMember,
    });
    return member
      ? getApplicationMemberFromPrismaApplicationMember(member)
      : null;
  }

  async getAllMembersWithSpaces(
    userId: number,
  ): Promise<ApplicationSpace[] | null> {
    const members = await this.prisma.member.findMany({
      where: {
        AND: [
          {
            userId,
          },
          {
            deleted: false,
          },
        ],
      },
      orderBy: {
        updated: 'desc',
      },
      select: {
        ...selectApplicationMember,
        space: {
          select: selectSimpleSpace,
        },
      },
    });

    if (!members) {
      return null;
    }

    return members.map(({ space, name, accepted, role }) => ({
      id: space.id,
      name: space.name,
      username: name,
      accepted: accepted,
      personal: space.personal,
      role: parseRole(role),
    }));
  }

  async isUserInSpace(userId: number, spaceId: number): Promise<boolean> {
    const member = await this.prisma.member.findUnique({
      where: {
        userId_spaceId: {
          userId,
          spaceId,
        },
      },
      select: { id: true },
    });
    return !!member;
  }

  async deleteMember(memberId: number, userId: number) {
    return await this.prisma.member.deleteMany({
      where: {
        AND: [
          {
            id: memberId,
          },
          {
            userId: {
              not: userId,
            },
          },
        ],
      },
    });
  }

  async acceptInvitation(memberId: number): Promise<ApplicationMember | null> {
    const member = await this.prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        accepted: true,
      },
      select: selectApplicationMember,
    });
    return getApplicationMemberFromPrismaApplicationMember(member);
  }

  leaveSpace(memberId: number) {
    // Member can't be owner
    return this.prisma.member.delete({
      where: {
        id: memberId,
      },
    });
  }

  async updateRole(
    memberId: number,
    role: RoleType,
  ): Promise<ApplicationMember | null> {
    const member = await this.prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        role: role,
      },
      select: selectApplicationMember,
    });
    return member
      ? getApplicationMemberFromPrismaApplicationMember(member)
      : null;
  }
}
