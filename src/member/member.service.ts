import { Injectable } from '@nestjs/common';
import { Member } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { RoleType } from '../auth/role.enum';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  createMemberWithSpace(
    accountId: string,
    name: string,
    accepted = false,
  ): Promise<Member> {
    return this.prisma.member.create({
      data: {
        name,
        role: RoleType.OWNER,
        accepted,
        account: {
          connect: {
            id: accountId,
          },
        },
        spaceOwner: {
          create: {},
        },
      },
    });
  }
}
