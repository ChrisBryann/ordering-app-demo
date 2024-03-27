import { DynamicModule, Module } from '@nestjs/common';
import { RmqService } from './rmq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

interface RMqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  // convert this into a dynamic module
  static register({ name }: RMqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          // module that will be used to register RabbitMQ service when we import it from NestJS microservice
          {
            name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RABBIT_MQ_URI')],
                queue: configService.get<string>(`RABBIT_MQ_${name}_QUEUE`),
              },
            }), // inject the config service when we defined how to connect to the service
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule], // the consuming module that imports this module will have this ClientsModule with the registered RabbitMQ service
    };
  }
}
