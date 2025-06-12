import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';

const port = process.env.PORT || 4000
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  //   bufferLogs: true
  // });

  app.useLogger(app.get(Logger))

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://guest:guest@rabbitmq:5672'],
  //     queue: 'cats_queue',
  //     queueOptions: {
  //       durable: false,
  //     },
  //   },
  // });
  
  await app.startAllMicroservices();  
  app.setGlobalPrefix('api');
  // app.enableCors({
  //   origin: process.env.CLIENT_URLS,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // })
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CLIENT_URLS ?? '')
        .split(',')
        .map(url => url.trim());
  
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow access from origin ${origin}`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  

  const config = new DocumentBuilder()
    .setTitle('API docs')
    .setDescription('The API documentation')
    .setVersion('1.0')
    // .addTag('auth') // tuỳ chọn
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.use(cookieParser());
  // app.use(rateLimit({
  //   windowMs: 60*1000,
  //   limit: 10,
  //   message: 'Too many requests, please try again later!'
  // }))
  app.useGlobalFilters(); // ok
  // app.useStaticAssets();
  await app.listen(port, '0.0.0.0',() => {
  });
  // await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
