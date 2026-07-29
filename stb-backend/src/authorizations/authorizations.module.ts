import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Authorization, AuthorizationSchema } from './schemas/authorization.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthorizationsController } from './authorizations.controller';
import { AuthorizationsService } from './authorizations.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Authorization.name, schema: AuthorizationSchema }]),
    NotificationsModule,
  ],
  controllers: [AuthorizationsController],
  providers: [AuthorizationsService],
  exports: [AuthorizationsService],
})
export class AuthorizationsModule {}
