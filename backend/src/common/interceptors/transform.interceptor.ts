import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If controller/service already returned a full envelope (avoid double-wrapping)
        if (data && typeof data === 'object') {
          const hasStatusCode = Object.prototype.hasOwnProperty.call(data, 'statusCode');
          const hasSuccess = Object.prototype.hasOwnProperty.call(data, 'success');
          const hasData = Object.prototype.hasOwnProperty.call(data, 'data');

          if (hasStatusCode || hasSuccess || hasData) {
            // Assume caller already formatted the response; pass through
            return data as any;
          }
        }

        // Normalize to a single response envelope
        return {
          statusCode: 200,
          message: (data && typeof data === 'object' && (data as any).message) || 'Success',
          data,
        } as any;
      }),
    );
  }
}