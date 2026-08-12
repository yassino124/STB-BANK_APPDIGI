import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { BusinessRule, BusinessRuleSchema } from './schemas/rules.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: BusinessRule.name, schema: BusinessRuleSchema }]),
  ],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService], // Exported for other modules to use
})
export class RulesModule {}
