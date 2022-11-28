import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QuestionId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return Number(request.params.questionId);
  },
);
