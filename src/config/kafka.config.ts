import { KafkaOptions, Transport } from "@nestjs/microservices";

export const kafkaConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
        client: {
            brokers: ['localhost:9002'],
        },
        consumer: {
            groupId: 'my-nest-consumer'
        }
    }
}