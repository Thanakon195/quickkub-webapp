import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
  },
});

export const getJwtRefreshConfig = (configService: ConfigService): JwtModuleOptions => {
  const refreshSecret = configService.get('JWT_REFRESH_SECRET');
  const secret = refreshSecret ? refreshSecret : configService.get('JWT_SECRET');
  return {
    secret,
    signOptions: {
      expiresIn: configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    },
  };
};
