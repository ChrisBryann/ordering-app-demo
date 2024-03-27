import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    // used for each microservices to call when they're initializing it, to have a single place where we can configure all our RabbitMQ microservices
    return {
      transport: Transport.RMQ, // type of message queue
      options: {
        urls: [this.configService.get<string>('RABBIT_MQ_URI')], // make sure this env var is available in any microservice we're using
        queue: this.configService.get<string>(`RABBIT_MQ_${queue}_QUEUE`),
        noAck, // specify if the message will be acknowledge automatically everytime it's finished to pop it off the queue --> useful if we want to handle message failures
        persistent: true, // maintain our list of messages
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
