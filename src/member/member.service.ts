import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  selectSimpleSpaceWithMemberIds,
  SimpleSpaceWithMemberIds,
} from '../space/space.interface';
import { selectApplicationMember } from './member.interface';

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

  async isMemberInSpace(accountId: string, spaceId: number): Promise<boolean> {
    // const member = await this.prisma.member.findFirst({
    //   where: {
    //     OR: [
    //       { AND: [{ accountId }, { spaceOwnerId: spaceId }] },
    //       { AND: [{ accountId }, { spaceId }] },
    //     ],
    //   },
    //   select: {
    //     id: true,
    //   },
    // });
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
    console.log(accountId);
    console.log(spaceId);
    return !!member;
  }
}
