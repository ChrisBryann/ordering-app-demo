import { RmqModule } from '@app/common';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AUTH_SERVICE } from './service';

@Module({
  imports: [RmqModule.register({ name: AUTH_SERVICE })],
  exports: [RmqModule], // so that any other module that use this app will have the rabbitmq service available
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // implement cookie parsing: parse incoming cookie and look for potential JWT
    consumer.apply(cookieParser()).forRoutes('*'); // take cookies and add them to the current request object
  }
}
