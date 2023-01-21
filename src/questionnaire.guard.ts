import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth/auth.service';
import { RoleType } from './role';

@Injectable()
export class QuestionnaireGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(AuthService) private authService: AuthService,
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
      throw new HttpException(
        {
          status: 420,
          error: 'Not logged in',
        },
        420,
      );
    }

    const memberAuth = await this.authService.authenticateQuestionnaireRoute(
      jwtPayload.id,
      questionnaireId,
    );

    if (!memberAuth) {
      throw new HttpException(
        {
          status: 420,
          error: 'Not logged in',
        },
        420,
      );
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
