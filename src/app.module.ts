import { Module, ValidationPipe } from '@nestjs/common';
import { TicketModule } from './ticket/ticket.module';
import { AgentModule } from './agent/agent.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('NODE_ENV') === 'production'
            ? configService.get<string>('MONGO_URL')
            : configService.get<string>('MONGO_TEST_URL'),
      }),
      inject: [ConfigService],
    }),
    TicketModule,
    AgentModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
