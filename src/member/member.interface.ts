import { Prisma } from '@prisma/client';
import { parseRole, RoleType } from '../role';

export interface PrismaApplicationMember {
  id: number;
  name: string;
  role: string;
  accepted: boolean;
  account: { user: { email: string } };
}

export const getApplicationMemberFromPrismaApplicationMember = (
  member: PrismaApplicationMember,
): ApplicationMember => ({
  id: member.id,
  name: member.name,
  role: parseRole(member.role),
  accepted: member.accepted,
  email: member.account.user.email,
});

export interface ApplicationMember {
  id: number;
  name: string;
  role: RoleType;
  accepted: boolean;
  email: string;
}

export const selectApplicationMember = Prisma.validator<Prisma.MemberSelect>()({
  id: true,
  name: true,
  role: true,
  accepted: true,
  account: {
    select: {
      user: {
        select: {
          email: true,
        },
      },
    },
  },
});
