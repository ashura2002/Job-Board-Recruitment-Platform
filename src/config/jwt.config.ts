import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export const jwtConfigFactory = (config: ConfigService): JwtModuleOptions => ({
  secret: config.get<string>('JWT_SECRET'),
  signOptions: {
    expiresIn: config.get<string>(
      'JWT_EXPIRES_IN',
    ) as JwtSignOptions['expiresIn'],
  },
});
