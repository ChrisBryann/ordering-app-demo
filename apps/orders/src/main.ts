import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  app.useGlobalPipes(new ValidationPipe()); // make sure to apply global pipe for validation
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
