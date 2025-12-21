import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, JwtModule, UsersModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
