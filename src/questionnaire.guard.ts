import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth/auth.service';
import { RoleType } from './role';
import { AccountService } from './account/account.service';

@Injectable()
export class QuestionnaireGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(AuthService) private authService: AuthService,
    @Inject(AccountService) private accountService: AccountService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<RoleType[]>('roles', context.getHandler());
    const requiredRole = roles ? roles[0] : RoleType.VIEW;

    const request = context.switchToHttp().getRequest();

    const jwtPayload = this.authService.getJwtPayload(
      request.headers.authorization,
    );

    const questionnaireId = Number(request.params.id) || null;

    if (!jwtPayload || !questionnaireId) {
      return false;
    }

    const memberAuth = await this.authService.authenticateQuestionnaireRoute(
      jwtPayload.id,
      questionnaireId,
    );

    if (!memberAuth) {
      return false;
    }

    // From request
    request['userId'] = jwtPayload.id;
    request['questionnaireId'] = questionnaireId;
    // To get
    request['memberId'] = memberAuth.memberId;
    request['role'] = memberAuth.role;
    request['spaceId'] = memberAuth.spaceId;

    return this.authService.isRoleEnough(requiredRole, memberAuth.role);
  }
}
