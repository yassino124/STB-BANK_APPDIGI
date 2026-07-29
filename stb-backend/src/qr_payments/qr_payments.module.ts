import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QrPayment, QrPaymentSchema } from './schemas/qr-payment.schema';
import { QrPaymentsService } from './qr-payments.service';
import { QrPaymentsController } from './qr_payments.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: QrPayment.name, schema: QrPaymentSchema }])],
  providers: [QrPaymentsService],
  controllers: [QrPaymentsController],
  exports: [QrPaymentsService],
})
export class QrPaymentsModule {}
