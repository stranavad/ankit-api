import { Injectable } from '@nestjs/common';
import { RoleType } from '../role';

@Injectable()
export class AuthService {
  isExpiresAtValid(expiresAt: number | null): boolean {
    const currentData = Math.floor(Date.now() / 1000);
    return expiresAt ? expiresAt >= currentData : false;
  }

  parseAuthorizationToken(header: string): string | null {
    return header?.split(' ')[1] || null;
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
