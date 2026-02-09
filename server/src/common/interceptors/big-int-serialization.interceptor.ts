import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function convertBigIntToString(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj === 'number' && Math.abs(obj) > Number.MAX_SAFE_INTEGER) {
    return obj.toString();
  }
  if (Array.isArray(obj)) return obj.map(convertBigIntToString);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = convertBigIntToString(obj[key]);
    }
    return result;
  }
  return obj;
}

@Injectable()
export class BigIntSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => convertBigIntToString(data)));
  }
}
