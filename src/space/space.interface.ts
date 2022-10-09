import { Space } from '@prisma/client';
import { RoleType } from '../role';
import { Prisma } from '@prisma/client';

export interface SimpleSpace extends Pick<Space, 'id' | 'name' | 'personal'> {
  role: RoleType;
}
export const selectSimpleSpace = Prisma.validator<Prisma.SpaceSelect>()({
  id: true,
  name: true,
  personal: true,
});

export interface SimpleSpaceWithMemberIds extends SimpleSpace {
  members: { id: number }[];
}
export const selectSimpleSpaceWithMemberIds =
  Prisma.validator<Prisma.SpaceSelect>()({
    id: true,
    name: true,
    personal: true,
    members: {
      select: {
        id: true,
      },
    },
  });

export interface ApplicationSpace
  extends Pick<Space, 'id' | 'name' | 'personal'> {
  role: RoleType;
  username: string;
  accepted: boolean;
  memberCount: number;
}
