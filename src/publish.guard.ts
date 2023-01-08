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
  export class PublishGuard implements CanActivate {
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
      const publishedId = Number(request.params.publishedId) || null;
  
      if (!jwtPayload || !questionnaireId || !publishedId) {
        return false;
      }
  
      const memberAuth = await this.authService.authenticatePublishRoute(
        jwtPayload.id,
        questionnaireId,
        publishedId
      );
  
      if (!memberAuth) {
        return false;
      }
  
      // From request
      request['userId'] = jwtPayload.id;
      request['questionnaireId'] = questionnaireId;
      request['publishedId'] = publishedId;
      // To get
      request['memberId'] = memberAuth.memberId;
      request['role'] = memberAuth.role;
      request['spaceId'] = memberAuth.spaceId;
  
      return this.authService.isRoleEnough(requiredRole, memberAuth.role);
    }
  }