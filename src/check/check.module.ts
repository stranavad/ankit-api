import { Module } from '@nestjs/common';
import { CheckController } from './check.controller';
import { CheckService } from './check.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CheckController],
  providers: [CheckService, PrismaService]
})
export class CheckModule {}
