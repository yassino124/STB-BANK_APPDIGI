import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FraudDetection, FraudDetectionSchema } from './schemas/fraud-detection.schema';
import { FraudDetectionsService } from './fraud-detections.service';
import { FraudDetectionsController } from './fraud-detections.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FraudDetection.name, schema: FraudDetectionSchema }])],
  providers: [FraudDetectionsService],
  controllers: [FraudDetectionsController],
  exports: [FraudDetectionsService],
})
export class FraudDetectionModule {}
