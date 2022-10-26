import { Prisma } from '@prisma/client';

export interface ApplicationUser {
  id: number;
  name: string;
  email: string;
  image: string | null;
}

export type SearchUser = Omit<ApplicationUser, 'email'>;

export const selectApplicationUser = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  image: true,
});

export const selectSearchuser = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  image: true,
});
