import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  selectSimpleSpaceWithMemberIds,
  SimpleSpaceWithMemberIds,
} from '../space/space.interface';
import {
  ApplicationMember,
  getApplicationMemberFromPrismaApplicationMember,
  selectApplicationMember,
} from './member.interface';
import { parseRole, RoleType } from '../role';

export interface AllMembersWithSpaces {
  members: {
    id: number;
    name: string;
    role: string;
    accepted: boolean;
    space: Omit<SimpleSpaceWithMemberIds, 'role'> | null;
    spaceOwner: Omit<SimpleSpaceWithMemberIds, 'role'> | null;
  }[];
}

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  createDefaultMember(userId: number) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        members: {
          create: {
            name: 'Me',
            accepted: true,
            role: RoleType.OWNER,
            spaceOwner: {
              create: {
                name: 'Personal space',
                personal: true,
                description: 'This is your personal space',
              },
            },
          },
        },
      },
    });
  }

  getAllMembersWithSpaces(userId: number): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        members: {
          orderBy: {
            updated: 'desc',
          },
          select: {
            ...selectApplicationMember,
            space: {
              select: {
                ...selectSimpleSpaceWithMemberIds,
              },
            },
            spaceOwner: {
              select: {
                ...selectSimpleSpaceWithMemberIds,
              },
            },
          },
        },
      },
    });
  }

  async isMemberInSpace(memberId: number, spaceId: number): Promise<boolean> {
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        spaceId,
      },
    });
    return !!member;
  }

  async getMemberRole(memberId: number): Promise<RoleType | null> {
    const member = await this.prisma.member.findUnique({
      where: {
        id: memberId,
      },
      select: {
        role: true,
      },
    });
    return member ? parseRole(member.role) : null;
  }

  async deleteMember(memberId: number) {
    return await this.prisma.member.delete({
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
