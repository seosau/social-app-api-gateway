import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly requests = new Map<string, number>()
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest()
        const ip = req.ip
        const count = this.requests.get(ip) || 0;

        if(count >= 5) {
            throw new ForbiddenException('Too many request!!!!')
        }

        this.requests.set(ip, count+1)

        setTimeout(() => {
            this.requests.set(ip, 0)
        }, 60*1000)

        return true
    }
    
}