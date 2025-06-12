// // src/comment/comment.grpc-client.ts
// import { ClientProxyFactory, Transport, ClientOptions } from '@nestjs/microservices';
// import { join } from 'path';

// export const CommentGrpcClientProvider = {
//   provide: 'COMMENT_CLIENT',
//   useFactory: () => {
//     const options: ClientOptions = {
//       transport: Transport.GRPC,
//       options: {
//         url: '0.0.0.0:50051',
//         package: 'comment',
//         protoPath: join(__dirname, '../../../proto/comment.proto'),
//       },
//     };
//     return ClientProxyFactory.create(options);
//   },
// };
