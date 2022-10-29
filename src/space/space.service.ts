import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { parseRole, RoleType } from '../role';
import {
  ApplicationSpace,
  CurrentSpace,
  DetailSpace,
  selectApplicationSpace,
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
        members: {
          select: selectApplicationMember,
        },
      },
    });

    return space
      ? getApplicationMembersFromPrismaApplicationMembers(space.members)
      : null;
  }

  async updateSpace(
    data: UpdateSpaceData,
    id: number,
    memberId: number,
  ): Promise<ApplicationSpace | null> {
    const space = await this.prisma.space.update({
      where: {
        id,
      },
      data,
      select: {
        ...selectSimpleSpace,
        members: {
          where: {
            id: memberId,
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

  async addMemberToSpace({
    spaceId,
    userId,
    role,
    name,
  }: AddMember): Promise<ApplicationMember[]> {
    const { members } = await this.prisma.space.update({
      where: {
        id: spaceId,
      },
      data: {
        members: {
          create: {
            name,
            role,
            accepted: false,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
      select: {
        members: {
          select: selectApplicationMember,
        },
      },
    });
    return members.map(getApplicationMemberFromPrismaApplicationMember);
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

  // async transferOwnership(
  //   memberId: number,
  //   ownerId: number,
  //   spaceId: number,
  // ): Promise<ApplicationSpaceWithApplicationMembers> {
  //   const data = await this.prisma.space.update({
  //     where: {
  //       id: spaceId,
  //     },
  //     data: {
  //       members: {
  //         update: [
  //           {
  //             where: {
  //               id: memberId,
  //             },
  //             data: {
  //               role: RoleType.OWNER,
  //             },
  //           },
  //           {
  //             where: {
  //               id: ownerId,
  //             },
  //             data: {
  //               role: RoleType.ADMIN,
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       personal: true,
  //       members: { select: selectApplicationMember },
  //     },
  //   });
  //   const members = data.members.map(
  //     getApplicationMemberFromPrismaApplicationMember,
  //   );
  //   const currentMember = members.find(({ id }) => id === ownerId);
  //   return {
  //     id: data.id,
  //     name: data.name,
  //     personal: data.personal,
  //     role: currentMember?.role || RoleType.VIEW,
  //     username: currentMember?.name || 'username',
  //     accepted: currentMember?.accepted || false,
  //     memberCount: members.length,
  //     members,
  //   };
  // }
}
