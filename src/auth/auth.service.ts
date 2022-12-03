import { Injectable } from '@nestjs/common';
import { parseRole, RoleType } from '../role';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.interface';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  getJwtPayload(token: string): null | JwtPayload {
    const parsedToken = token.split(' ')[1];
    if (!parsedToken) {
      return null;
    }
    return this.jwtService.verify(parsedToken) as JwtPayload;
  }

  async authenticateSpaceRoute(
    userId: number,
    spaceId: number,
  ): Promise<{ id: number; role: RoleType } | null> {
    const member = await this.prismaService.member.findUnique({
      where: {
        userId_spaceId: {
          userId,
          spaceId,
        },
      },
      select: {
        id: true,
        role: true,
      },
    });
    return member ? { ...member, role: parseRole(member.role) } : null;
  }

  async authenticateQuestionnaireRoute(
    userId: number,
    questionnaireId: number,
  ): Promise<{ memberId: number; role: RoleType; spaceId: number } | null> {
    const questionnaire = await this.prismaService.questionnaire.findUnique({
      where: {
        id: questionnaireId,
      },
      select: {
        space: {
          select: {
            id: true,
            members: {
              where: {
                userId,
              },
              select: {
                id: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!questionnaire) {
      return null;
    }

    const space = questionnaire.space;
    const member = questionnaire.space.members[0];
    return {
      memberId: member.id,
      spaceId: space.id,
      role: parseRole(member.role),
    };
  }

  isRoleEnough(requiredRole: RoleType, actualRole: RoleType): boolean {
    switch (requiredRole) {
      case RoleType.VIEW:
        return [
          RoleType.OWNER,
          RoleType.ADMIN,
          RoleType.EDIT,
          RoleType.VIEW,
        ].includes(actualRole);
      case RoleType.EDIT:
        return [RoleType.OWNER, RoleType.ADMIN, RoleType.EDIT].includes(
          actualRole,
        );
      case RoleType.ADMIN:
        return [RoleType.OWNER, RoleType.ADMIN].includes(actualRole);
      case RoleType.OWNER:
        return actualRole === RoleType.OWNER;
    }
  }
}
