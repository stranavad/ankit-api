import { Injectable } from '@nestjs/common';
import { RoleType } from '../role';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  isExpiresAtValid(expiresAt: number | null): boolean {
    const currentData = Math.floor(Date.now() / 1000);
    return expiresAt ? expiresAt >= currentData : false;
  }

  parseAuthorizationToken(header: string): string | null {
    return header?.split(' ')[1] || null;
  }

  async checkJwt(token: string) {
    console.log(token);
    // const decoded = await this.jwtService.decode(token);
    console.log(
      await this.jwtService.verifyAsync(token, {
        secret: 'gaURUd9jRLXf1jDo709nDJwQZy1SsJbhspvRlb50LPFMyw7JCd',
      }),
    );
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
