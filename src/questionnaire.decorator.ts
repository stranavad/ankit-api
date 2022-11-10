import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QuestionnaireId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.questionnaireId;
  },
);
