import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IJwtResponse } from 'src/common/types/jwt.types';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeader(request);
    if (!accessToken) throw new UnauthorizedException('No token provided');

    try {
      const payload: IJwtResponse = await this.jwtService.verifyAsync(
        accessToken,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      // block the inActive user
      const user = await this.userService.findById(payload.userId);
      if (!user.isActive)
        throw new ForbiddenException('User is logout, Login again');

      // attach to request object
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  // method that extracting the token to the header
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [bearer, token] = authHeader.split(' ');
    return bearer === 'Bearer' ? token : undefined;
  }
}
