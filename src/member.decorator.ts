import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MemberId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.memberId;
  },
);
