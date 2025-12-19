import { Role } from 'src/generated/prisma/enums';

export type IJwtResponse = {
  userId: number;
  username: string;
  role: Role;
  email: string;
  fullname: string;
};
