import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  selectSimpleSpaceWithMemberIds,
  SimpleSpaceWithMemberIds,
} from '../space/space.interface';
import { selectApplicationMember } from './member.interface';
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

export interface MemberAuth {
  id: number;
  role: RoleType;
  accountId: string;
  expires_at: number | null;
}

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  getAllMembersWithSpaces(
    accountId: string,
  ): Promise<AllMembersWithSpaces | null> {
    return this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
      select: {
        members: {
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

  async getMemberAuthByAccountToken(
    access_token: string,
    spaceId: number,
  ): Promise<MemberAuth | null> {
    const member = await this.prisma.member.findFirst({
      where: {
        OR: [
          {
            AND: [
              {
                account: {
                  access_token,
                },
              },
              {
                spaceOwner: {
                  id: spaceId,
                },
              },
            ],
          },
          {
            AND: [
              {
                account: {
                  access_token,
                },
              },
              { spaceId },
            ],
          },
        ],
      },
      select: {
        id: true,
        role: true,
        accountId: true,
        account: {
          select: {
            expires_at: true,
          },
        },
      },
    });

    return member
      ? {
          id: member.id,
          role: parseRole(member.role),
          accountId: member.accountId,
          expires_at: member.account.expires_at,
        }
      : null;
  }

  async isMemberInSpace(accountId: string, spaceId: number): Promise<boolean> {
    const member = await this.prisma.member.findFirst({
      where: {
        OR: [
          {
            AND: [
              {
                accountId,
              },
              {
                spaceOwner: {
                  id: spaceId,
                },
              },
            ],
          },
          {
            AND: [
              {
                accountId,
              },
              { spaceId },
            ],
          },
        ],
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

  deleteMember(memberId: number) {
    this.prisma.member.delete({
      where: {
        id: memberId,
      },
    });
  }

  async deleteOwner(memberId: number, spaceId: number) {
    // First delete assigned members
    await this.prisma.member.deleteMany({
      where: {
        spaceId,
      },
    });
    // Delete space
    await this.prisma.space.delete({
      where: {
        id: spaceId,
      },
    });
    // Delete owner
    await this.prisma.member.delete({
      where: {
        space,
      },
    });
  }
}
