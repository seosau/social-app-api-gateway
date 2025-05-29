import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter } from "prom-client";
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    constructor(
        @InjectMetric('http_requests_total')
        private counter: Counter<string>
    ) {}
    use(req: Request, res: Response, next: NextFunction) {
        this.counter.inc({method: req.method, route: req.baseUrl})
        next()
    }
    
}