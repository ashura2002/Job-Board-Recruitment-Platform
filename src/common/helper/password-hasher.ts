import * as bcrypt from 'bcrypt';

const salt_round = 10;

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, salt_round);
};

export const compareHashPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
