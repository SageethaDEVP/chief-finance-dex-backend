import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ApplicationSeedModule } from '../application-seed/application-seed.module';
import {
  RedisConnection,
  DatabaseConnection,
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  etherConfig,
} from 'src/configs';
import { DbModule } from 'src/infrastructure/database';
import { LoggerMiddleware } from 'src/infrastructure/logger';
import { RedisModule } from 'src/infrastructure/redis';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../roles/roles.module';
import { WalletsModule } from '../wallets/wallets.module';
import { OtpModule } from '../otp/otp.module';
import { TokensModule } from '../tokens/tokens.module';
import { FeeModule } from '../fee/fee.module';
import { BDLTYToken } from '../bdlty-token/bdlty-token.module';
import { PairsModule } from '../pairs/pairs.module';
import { QuestionsModule } from '../questions/questions.module';
import { QuizSessionssModule } from '../quiz_sessions/quiz_sessions.module';
import { CorsMiddleware } from 'src/infrastructure/cors';
import { QuizModule } from '../quiz/quiz.module';
import { CronModule } from '../cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QuizUsersModule } from '../quiz_users/quiz_users.module';
import { GameAuthModule } from '../game-auth/game-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, appConfig, redisConfig, jwtConfig, etherConfig],
      isGlobal: true,
    }),
    DbModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConnection,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConnection,
    }),
    ScheduleModule.forRoot(),
    ApplicationSeedModule,
    AuthModule,
    RolesModule,
    WalletsModule,
    OtpModule,
    TokensModule,
    FeeModule,
    QuizModule,
    BDLTYToken,
    PairsModule,
    QuestionsModule,
    QuizSessionssModule,
    CronModule,
    QuizUsersModule,
    GameAuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // // Apply middleware globally to enable CORS for all routes
    // consumer.apply(CorsMiddleware).forRoutes('*');

    // Exclude CORS for a specific route
    // consumer
    //   .apply(CorsMiddleware)
    //   .exclude({
    //     path: '/quiz-session/get-session',
    //     method: RequestMethod.ALL,
    //   })
    //   .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
