import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
