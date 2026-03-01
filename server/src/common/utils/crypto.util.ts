import { createHash } from 'crypto';
import { PASSWORD_SALT } from '../constants';

export function md5Hash(content: string): string {
  return createHash('md5')
    .update(content + PASSWORD_SALT)
    .digest('hex');
}
