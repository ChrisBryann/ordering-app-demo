import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule); // create the auth app
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('AUTH', true)); // don't want to manually acknowledge message, because we're using the request response based message patterns instead of events
  app.useGlobalPipes(new ValidationPipe()); // to be able to use the validators accross the auth app
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT'));
}
bootstrap();
