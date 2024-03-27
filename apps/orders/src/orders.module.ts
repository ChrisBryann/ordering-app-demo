import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule, DatabaseModule, RmqModule } from '@app/common';
import { OrdersRepository } from './orders.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { BILLING_SERVICE } from './constants/service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make this module global to be instantiated once
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(), // specify the required env variables in validationSchema
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/orders/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), // need to import this to inject mongoose model and connection, using forFeature to specify what type of database table is being handled here
    RmqModule.register({
      name: BILLING_SERVICE,
    }),
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
