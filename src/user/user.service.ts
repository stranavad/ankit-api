import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ApplicationUser,
  SearchUser,
  selectApplicationUser,
  selectSearchuser,
} from './user.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async searchUsers(
    search: string,
    notUserIds: number[],
  ): Promise<SearchUser[]> {
    return this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                email: {
                  contains: search,
                },
              },
              {
                name: {
                  contains: search,
                },
              },
            ],
          },
          {
            id: {
              notIn: notUserIds,
            },
          },
        ],
      },
      select: selectSearchuser,
    });
  }

  getUserByEmail(
    email: string,
    currentUserId: number,
  ): Promise<ApplicationUser | null> {
    return this.prisma.user.findFirst({
      where: {
        AND: [
          {
            email,
          },
          {
            id: {
              not: {
                equals: currentUserId,
              },
            },
          },
        ],
      },
      select: selectApplicationUser,
    });
  }

  async findUserByEmail(
    email: string,
  ): Promise<{ id: number; name: string } | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async isUserInSpace(userId: number, spaceId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        members: {
          where: {
            spaceId,
          },
          select: {
            id: true,
          },
        },
      },
    });
    return !!user;
  }
}
