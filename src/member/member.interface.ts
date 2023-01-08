import { Prisma } from '@prisma/client';
import { parseRole, RoleType } from '../role';
import { SimpleSpace } from '../space/space.interface';

export interface PrismaApplicationMember {
  id: number;
  name: string;
  role: string;
  deleted: boolean;
  accepted: boolean;
  user: { id: number; email: string; image: string | null };
}

export const getApplicationMemberFromPrismaApplicationMember = (
  member: PrismaApplicationMember,
): ApplicationMember => ({
  id: member.id,
  name: member.name,
  role: parseRole(member.role),
  accepted: member.accepted,
  deleted: member.deleted,
  email: member.user.email,
  userId: member.user.id,
  image: member.user.image,
});

export const getApplicationMembersFromPrismaApplicationMembers = (
  members: PrismaApplicationMember[],
): ApplicationMember[] =>
  members.map(getApplicationMemberFromPrismaApplicationMember);

export interface ApplicationMember {
  id: number;
  name: string;
  role: RoleType;
  accepted: boolean;
  deleted: boolean,
  email: string;
  image: string | null;
  userId: number;
}

export const selectApplicationMember = Prisma.validator<Prisma.MemberSelect>()({
  id: true,
  name: true,
  role: true,
  deleted: true,
  accepted: true,
  user: {
    select: {
      id: true,
      email: true,
      image: true,
    },
  },
});

export const selectApplicationMembers = Prisma.validator<Prisma.MemberFindManyArgs>()({
  select: selectApplicationMember,
  orderBy: {
    updated: 'desc'
  },
  where: {
    deleted: false
  }
})


export interface AllMembersWithSpaces {
  members: {
    id: number;
    name: string;
    role: string;
    accepted: boolean;
    space: Omit<SimpleSpace, 'role'>;
  }[];
}

export interface UpdateMemberData {
  name: string;
}
