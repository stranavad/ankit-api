import { Module } from '@nestjs/common';
import { PublishService } from './publish.service';
import { PublishController } from './publish.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PublishService, PrismaService],
  controllers: [PublishController],
  imports: [AuthModule]
})
export class PublishModule {}
