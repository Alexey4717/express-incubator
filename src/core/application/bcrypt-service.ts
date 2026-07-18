import * as bcrypt from 'bcrypt';
import { injectable } from 'inversify';

@injectable()
export class BcryptService {
  async generateHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, passwordSalt);
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
