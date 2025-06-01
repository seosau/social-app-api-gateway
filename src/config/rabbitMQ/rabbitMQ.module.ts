// import { Module, Global } from '@nestjs/common';
// import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';

// @Global()
// @Module({
//   providers: [
//     {
//       provide: 'RABBITMQ_SERVICE',
//       useFactory: () => {
//         return ClientProxyFactory.create({
//           transport: Transport.RMQ,
//           options: {
//             urls: ['amqp://guest:guest@rabbitmq:5672'],
//             queue: 'cats_queue',
//             queueOptions: { durable: false },
//           },
//         });
//       },
//     },
//   ],
//   exports: ['RABBITMQ_SERVICE'],
// })
// export class RabbitMQModule {}
