import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import compression from '@fastify/compress';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { cors: true },
  );
  await app.register(compression, { encodings: ['gzip', 'deflate'] });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // app.enableCors();
  await app.listen(3001);
}
bootstrap().then(() => console.log('API Running'));
