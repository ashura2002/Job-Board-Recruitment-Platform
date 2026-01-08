import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UsersModule, PrismaModule, JwtModule],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}
