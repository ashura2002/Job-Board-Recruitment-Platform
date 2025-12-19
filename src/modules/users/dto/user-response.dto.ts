import { Role } from 'src/generated/prisma/enums';

export type IUserWithOutPassword = {
  id: number;
  email: string;
  fullname: string;
  username: string;
  role: Role;
  age: number;
  createdAt: Date;
  updatedAt: Date;
};
