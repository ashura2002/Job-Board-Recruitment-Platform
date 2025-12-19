import { Request } from 'express';
import { IJwtResponse } from './jwt.types';

export interface AuthUser extends Request {
  user: IJwtResponse;
}
