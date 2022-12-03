import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApplicationSpace, selectSimpleSpace } from '../space/space.interface';
import {
  AllMembersWithSpaces,
  ApplicationMember,
  getApplicationMemberFromPrismaApplicationMember,
  selectApplicationMember,
} from './member.interface';
import { parseRole, RoleType } from '../role';
import { Prisma } from '@prisma/client';

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

  async createDefaultMember(userId: number) {
    // TODO check if we can move to one simple query without multiple select
    // maybe update returns the updated data
    // or limit the number of returned members and spaces
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        members: {
          create: {
            name: 'Me',
            accepted: true,
            role: RoleType.OWNER,
            space: {
              create: {
                name: 'Personal space',
                personal: true,
                description: 'This is your personal space',
              },
            },
          },
        },
      },
      select: {
        members: {
          orderBy: {
            created: 'desc',
          },
          select: {
            id: true,
            space: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    const newSpaceId = user.members[0].space?.id;
    const newMemberId = user.members[0]?.id;
    if (!newSpaceId || !newMemberId) {
      return null;
    }
    return this.prisma.member.update({
      where: {
        id: newMemberId,
      },
      data: {
        space: {
          connect: {
            id: newSpaceId,
          },
        },
      },
    });
  }

  async getAllMembersWithSpaces(
    userId: number,
    filter: { accepted?: boolean; search?: string | null },
  ): Promise<ApplicationSpace[] | null> {
    let memberWhere = Prisma.validator<Prisma.MemberWhereInput>()({});
    if ((filter.accepted || filter.accepted === false) && filter.search) {
      memberWhere = {
        AND: [
          {
            accepted: filter.accepted,
          },
          {
            space: {
              name: {
                contains: filter.search,
              },
            },
          },
        ],
      };
    } else if (filter.accepted || filter.accepted === false) {
      memberWhere = {
        accepted: filter.accepted,
      };
    } else if (filter.search) {
      memberWhere = {
        space: {
          name: {
            contains: filter.search,
          },
        },
      };
    }
    const members = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        members: {
          where: memberWhere,
          orderBy: {
            updated: 'desc',
          },
          select: {
            ...selectApplicationMember,
            space: {
              select: selectSimpleSpace,
            },
          },
        },
      },
    });
    if (!members) {
      return null;
    }
    return this.mergeMembers(members);
  }

  mergeMembers(members: AllMembersWithSpaces): ApplicationSpace[] {
    return members.members.map(({ space, name, accepted, role }) => ({
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
