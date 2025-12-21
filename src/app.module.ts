import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    UsersModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
