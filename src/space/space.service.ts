import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { parseRole, RoleType } from '../role';
import {
  ApplicationSpace,
  CurrentSpace,
  DetailSpace,
  selectApplicationSpaceWithDescription,
  selectDetailSpace,
  selectSimpleSpace,
  UpdateSpaceData,
} from './space.interface';
import {
  ApplicationMember,
  getApplicationMemberFromPrismaApplicationMember,
  getApplicationMembersFromPrismaApplicationMembers,
  selectApplicationMember,
  selectApplicationMembers,
  UpdateMemberData,
} from '../member/member.interface';

export interface CreateSpace {
  userId: number;
  spaceName: string;
  memberName: string;
}

export interface AddMember {
  spaceId: number;
  userId: number;
  role: RoleType;
  name: string;
}

@Injectable()
export class SpaceService {
  constructor(private prisma: PrismaService) {}
  async createSpace({
    userId,
    spaceName,
    memberName,
  }: CreateSpace): Promise<ApplicationSpace> {
    const space = await this.prisma.space.create({
      data: {
        name: spaceName,
        members: {
          create: {
            name: memberName,
            accepted: true,
            role: RoleType.OWNER,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
      select: {
        ...selectSimpleSpace,
        members: {
          where: {
            userId,
          },
          select: {
            accepted: true,
            role: true,
            name: true,
          },
        },
      },
    });

    return {
      id: space.id,
      name: space.name,
      personal: space.personal,
      accepted: space.members[0].accepted,
      role: parseRole(space.members[0].role),
      username: space.members[0].name,
    };
  }

  async updateSpaceMember(
    data: UpdateMemberData,
    spaceId: number,
    userId: number,
  ): Promise<ApplicationSpace | null> {
    const member = await this.prisma.member.update({
      where: {
        userId_spaceId: {
          userId,
          spaceId,
        },
      },
      data: {
        name: data.name,
      },
      select: {
        ...selectApplicationMember,
        space: {
          select: selectSimpleSpace,
        },
      },
    });

    if (!member) {
      return null;
    }
    return {
      id: member.space.id,
      name: member.space.name,
      personal: member.space.personal,
      role: parseRole(member.role),
      username: member.name,
      accepted: member.accepted,
    };
  }

  async getMembers(spaceId: number): Promise<ApplicationMember[] | null> {
    const space = await this.prisma.space.findUnique({
      where: {
        id: spaceId,
      },
      select: {
        members: selectApplicationMembers,
      },
    });

    return space
      ? getApplicationMembersFromPrismaApplicationMembers(space.members)
      : null;
  }

  async updateSpace(
    data: UpdateSpaceData,
    id: number,
  ): Promise<DetailSpace | null> {
    const space = await this.prisma.space.update({
      where: {
        id,
      },
      data,
      select: selectDetailSpace,
    });

    return {
      id: space.id,
      name: space.name,
      description: space.description,
      personal: space.personal,
      members: getApplicationMembersFromPrismaApplicationMembers(space.members),
    };
  }

  async addMemberToSpace({
    spaceId,
    userId,
    role,
    name,
  }: AddMember): Promise<ApplicationMember[]> {
    const data = await this.prisma.member.upsert({
      where: {
        userId_spaceId: {
          userId,
          spaceId,
        }
      },
      create: {
        name,
        role,
        accepted: false,
        user: {
          connect: {
            id: userId,
          }
        },
        space: {
          connect: {
            id: spaceId
          }
        }
      },
      update: {
        name,
        role,
        accepted: false,
        deleted: false,
      },
      select: {
        space: {
          select: {
            members: selectApplicationMembers
          }
        }
      }
    })
    return data.space.members.map(getApplicationMemberFromPrismaApplicationMember);
  }

  async deleteSpace(spaceId: number) {
    const member = await this.prisma.member.findFirst({
      where: {
        spaceId,
      },
      select: {
        id: true,
        role: true,
      },
    });
    if (!member || parseRole(member.role) !== RoleType.OWNER) {
      return;
    }
    await this.prisma.space.delete({
      where: {
        id: spaceId,
      },
    });
  }

  async getDetailsSpaceById(spaceId: number): Promise<DetailSpace | null> {
    const space = await this.prisma.space.findUnique({
      where: {
        id: spaceId,
      },
      select: selectDetailSpace,
    });

    if (!space) {
      return null;
    }

    return {
      id: space.id,
      name: space.name,
      description: space.description,
      personal: space.personal,
      members: getApplicationMembersFromPrismaApplicationMembers(space.members),
    };
  }

  async getCurrentSpace(
    spaceId: number,
    memberId: number,
  ): Promise<CurrentSpace | null> {
    const member = await this.prisma.member.findUnique({
      where: {
        id: memberId,
      },
      select: {
        ...selectApplicationMember,
        space: {
          select: selectApplicationSpaceWithDescription,
        },
      },
    });
    return member
      ? {
          member: getApplicationMemberFromPrismaApplicationMember(member),
          space: {
            ...member.space,
            role: parseRole(member.role),
            username: member.name,
            accepted: member.accepted,
          },
        }
      : null;
  }

  async leaveSpace(memberId: number): Promise<boolean> {
    await this.prisma.member.delete({
      where: {
        id: memberId,
      },
    });
    return true;
  }

}
