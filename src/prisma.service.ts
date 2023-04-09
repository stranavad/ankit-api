import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    this.$use(async (params, next) => {
      if (params.model == 'Question') {
        if (params.action == 'delete') {
          params.action = 'update';
          params.args['data'] = { deleted: true };
        }
      }

      if (params.model == 'Member') {
        if (params.action == 'delete') {
          params.action = 'update';
          params.args['data'] = { deleted: true };
        }
      }

      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
