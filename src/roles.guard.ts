import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth/auth.service';
import { RoleType } from './role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(AuthService) private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<RoleType[]>('roles', context.getHandler());
    // Generate roles hierarchy
    if (roles[0] === RoleType.ADMIN) {
      roles.push(RoleType.OWNER);
    } else if (roles[0] === RoleType.EDIT) {
      roles.push(RoleType.ADMIN, RoleType.OWNER);
    } else if (roles[0] === RoleType.VIEW) {
      roles.push(RoleType.EDIT, RoleType.ADMIN, RoleType.OWNER);
    }

    if (!roles) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    let authorizationHeader = request.headers.authorization || null;

    if (!authorizationHeader) {
      return false;
    }
    authorizationHeader = authorizationHeader.split(' ')[1];

    const member = await this.authService.getAccountRole(
      authorizationHeader,
      parseInt(request.params['id']),
    );

    if (!member) {
      return false;
    }

    // const currentDate = Date.now();
    // return member.expires_at >= currentDate;

    request['accountId'] = member.accountId;
    request['memberId'] = member.id;
    request['role'] = member.role;
    return roles.includes(member.role);
  }
}
