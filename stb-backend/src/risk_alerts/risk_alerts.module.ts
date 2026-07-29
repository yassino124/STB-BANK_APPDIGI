import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RiskAlert, RiskAlertSchema } from './schemas/risk-alert.schema';
import { RiskAlertsService } from './risk-alerts.service';
import { RiskAlertsController } from './risk-alerts.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: RiskAlert.name, schema: RiskAlertSchema }])],
  providers: [RiskAlertsService],
  controllers: [RiskAlertsController],
  exports: [RiskAlertsService],
})
export class RiskAlertsModule {}
