import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development', '.env.production'],
      load: [() => import('./database.config'), () => import('./jwt.config'), () => import('./redis.config'), () => import('./swagger.config')],
      cache: true,
    }),
  ],
  exports: [ConfigModule, ConfigService],
})
export class AppConfigModule {}
