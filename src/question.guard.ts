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
  export class QuestionGuard implements CanActivate {
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
      const questionId = Number(request.params.questionId) || null;
  
      if (!jwtPayload || !questionnaireId || !questionId) {
        return false;
      }
  
      const memberAuth = await this.authService.authenticateQuestionRoute(
        jwtPayload.id,
        questionnaireId,
        questionId,
      );
  
      if (!memberAuth) {
        return false;
      }
  
      // From request
      request['userId'] = jwtPayload.id;
      request['questionnaireId'] = questionnaireId;
      request['questionId'] = questionId;
      // To get
      request['memberId'] = memberAuth.memberId;
      request['role'] = memberAuth.role;
      request['spaceId'] = memberAuth.spaceId;
  
      return this.authService.isRoleEnough(requiredRole, memberAuth.role);
    }
  }
  