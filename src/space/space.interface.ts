import { Space } from '@prisma/client';
import { RoleType } from '../role';
import { Prisma } from '@prisma/client';
import {
  ApplicationMember,
  selectApplicationMembers,
} from '../member/member.interface';

export interface SimpleSpace extends Pick<Space, 'id' | 'name' | 'personal'> {
  role: RoleType;
}
export const selectSimpleSpace = Prisma.validator<Prisma.SpaceSelect>()({
  id: true,
  name: true,
  personal: true,
});

export const selectApplicationSpace = Prisma.validator<Prisma.SpaceSelect>()({
  id: true,
  name: true,
  personal: true,
});

export interface ApplicationSpace
  extends Pick<Space, 'id' | 'name' | 'personal'> {
  role: RoleType;
  username: string;
  accepted: boolean;
}

export interface ApplicationSpaceWithDescription extends ApplicationSpace {
  description: string | null;
}

export const selectApplicationSpaceWithDescription =
  Prisma.validator<Prisma.SpaceSelect>()({
    id: true,
    name: true,
    personal: true,
    description: true,
  });

export interface CurrentSpace {
  space: ApplicationSpaceWithDescription;
  member: ApplicationMember;
}

export interface UpdateSpaceData {
  name?: string;
  description?: string;
}

export const selectDetailSpace = Prisma.validator<Prisma.SpaceSelect>()({
  id: true,
  name: true,
  description: true,
  personal: true,
  members: selectApplicationMembers,
});

export interface DetailSpace {
  id: number;
  name: string;
  description: string | null;
  personal: boolean;
  members: ApplicationMember[];
}
