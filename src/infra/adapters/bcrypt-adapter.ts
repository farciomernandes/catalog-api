import { HashComparer } from '@/data/protocols/cryptography/hash-compare';
import { IHasher } from '@/data/protocols/cryptography/hasher';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
@Injectable()
export class BcryptAdapter implements IHasher, HashComparer {
  private salt: number;

  constructor(private readonly configService: ConfigService) {
    this.salt = Number(configService.get<string>('SALT'));
  }

  async hash(text: string): Promise<string> {
    const hash = await bcrypt.hash(text, this.salt);
    return hash;
  }
  async compare(value: string, hash: string): Promise<boolean> {
    const isValid = await bcrypt.compare(value, hash);
    return isValid;
  }
}
