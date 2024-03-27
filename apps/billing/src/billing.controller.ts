import { Controller, Get, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { JwtAuthGuard, RmqService } from '@app/common';

@Controller()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly rmqService: RmqService,
  ) {}

  @Get()
  getHello(): string {
    return this.billingService.getHello();
  }

  @EventPattern('order_created')
  @UseGuards(JwtAuthGuard) // make sure jwt is passed in this route
  async handleOrderCreated(
    @Payload() data: any,
    @Ctx()
    context: RmqContext /* set of info about where this request is from (rabbitmq) */,
  ) {
    this.billingService.bill(data);
    this.rmqService.ack(context); // only when bill did succeed and no error is thrown, then we will acknowledge the message and the message will be taken off the queue
  }
}
