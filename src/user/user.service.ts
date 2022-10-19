import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface UserAuth {
  id: number | null;
  accessToken: string | null;
  expiresAt: number | null;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserIdByAccessToken(id: number): Promise<UserAuth | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        id,
      },
      select: {
        access_token: true,
        expires_at: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    return account
      ? {
          id: account.user.id,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
        }
      : null;
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
            OR: [{ spaceId }, { spaceOwner: { id: spaceId } }],
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
