import { Module } from "@nestjs/common";
import { makeCounterProvider, PrometheusModule } from "@willsoto/nestjs-prometheus";
import { MetricsMiddleware } from "./middlewares/metrics.middleware";
const httpRequestsTotalProvider = makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total number of HTTP request',
    labelNames: ['method', 'route']
  });
  
@Module({
    imports: [PrometheusModule],
    providers: [
        httpRequestsTotalProvider,
        MetricsMiddleware
    ],
    exports: [
        httpRequestsTotalProvider
    ]
})
export class MonitoringModule {}