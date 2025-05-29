import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap, map } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const now = Date.now()
        return next.handle().pipe(
            tap(() => {
                const ms = Date.now() - now
                const request = context.switchToHttp().getRequest()
                console.log(`Handle ${request.method} ${request.url} in ${ms}ms`)
            }),
            map((data) => {
                return {
                    success: true,
                    timestmap: Date.now(),
                    data
                }
            })
        )
    }
}