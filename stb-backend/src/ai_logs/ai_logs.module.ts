import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiLog, AiLogSchema } from './schemas/ai-log.schema';
import { AiLogsService } from './ai-logs.service';
import { AiLogsController } from './ai-logs.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AiLog.name, schema: AiLogSchema }])],
  providers: [AiLogsService],
  controllers: [AiLogsController],
  exports: [AiLogsService],
})
export class AiLogsModule {}
