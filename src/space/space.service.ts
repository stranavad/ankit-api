import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { parseRole, RoleType } from '../role';
import {
  ApplicationSpace,
  ApplicationSpaceWithApplicationMembers,
  selectSimpleSpace,
} from './space.interface';
import { AllMembersWithSpaces } from '../member/member.service';
import {
  ApplicationMember,
  getApplicationMemberFromPrismaApplicationMember,
  PrismaApplicationMember,
  selectApplicationMember,
} from '../member/member.interface';

export interface CreateSpace {
  accountId: string;
  spaceName: string;
  memberName: string;
}

export interface AddMember {
  spaceId: number;
  accountId: string;
  role: RoleType;
  name: string;
}

@Injectable()
export class SpaceService {
  constructor(private prisma: PrismaService) {}

  mergeSpaces(members: AllMembersWithSpaces): ApplicationSpace[] {
    const spaces: ApplicationSpace[] = [];
    members.members.forEach((member) => {
      const space = member.space || member.spaceOwner;
      if (space) {
        spaces.push({
          id: space.id,
          name: space.name,
          username: member.name,
          accepted: member.accepted,
          personal: space.personal,
          role: parseRole(member.role),
          memberCount: space.members.length + 1, // + owner
        });
      }
    });
    return spaces;
  }

  async createSpace({
    accountId,
    spaceName,
    memberName,
  }: CreateSpace): Promise<ApplicationSpace> {
    const space = await this.prisma.space.create({
      data: {
        name: spaceName,
        owner: {
          create: {
            name: memberName,
            accepted: true,
            role: RoleType.OWNER,
            account: {
              connect: {
                id: accountId,
              },
            },
          },
        },
      },
      select: selectSimpleSpace,
    });

    return {
      ...space,
      accepted: true,
      role: RoleType.OWNER,
      username: memberName,
      memberCount: 1,
    };
  }

  mergeMembers(
    members: PrismaApplicationMember[],
    owner: PrismaApplicationMember,
  ): ApplicationMember[] {
    const parsedOwner = getApplicationMemberFromPrismaApplicationMember(owner);
    const parsedMembers = members.map(
      getApplicationMemberFromPrismaApplicationMember,
    );
    return [parsedOwner, ...parsedMembers];
  }

  async getMembers(spaceId: number): Promise<ApplicationMember[] | null> {
    const space = await this.prisma.space.findUnique({
      where: {
        id: spaceId,
      },
      select: {
        owner: {
          select: selectApplicationMember,
        },
        members: {
          select: selectApplicationMember,
        },
      },
    });

    return space ? this.mergeMembers(space.members, space.owner) : null;
  }

  async addMemberToSpace({
    spaceId,
    accountId,
    role,
    name,
  }: AddMember): Promise<ApplicationMember[]> {
    const { owner, members } = await this.prisma.space.update({
      where: {
        id: spaceId,
      },
      data: {
        members: {
          create: {
            name,
            role,
            accepted: false,
            account: {
              connect: {
                id: accountId,
              },
            },
          },
        },
      },
      select: {
        owner: {
          select: selectApplicationMember,
        },
        members: {
          select: selectApplicationMember,
        },
      },
    });
    return this.mergeMembers(members, owner);
  }

  async deleteSpace(spaceId: number) {
    await this.prisma.space.delete({
      where: {
        id: spaceId,
      },
    });
  }

  async transferOwnership(
    memberId: number,
    ownerId: number,
    spaceId: number,
  ): Promise<ApplicationSpaceWithApplicationMembers> {
    const data = await this.prisma.space.update({
      where: {
        id: spaceId,
      },
      data: {
        members: {
          disconnect: {
            id: memberId,
          },
          connect: {
            id: ownerId,
          },
        },
        owner: {
          connect: {
            id: memberId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        personal: true,
        members: { select: selectApplicationMember },
        owner: { select: selectApplicationMember },
      },
    });
    const members = this.mergeMembers(data.members, data.owner);
    const currentMember = members.find(({ id }) => id === ownerId);
    return {
      id: data.id,
      name: data.name,
      personal: data.personal,
      role: currentMember?.role || RoleType.VIEW,
      username: currentMember?.name || 'username',
      accepted: currentMember?.accepted || false,
      memberCount: members.length + 1,
      members,
    };
  }
}
