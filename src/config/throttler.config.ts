import { ThrottlerAsyncOptions } from "@nestjs/throttler";

export const throttlerConfig: ThrottlerAsyncOptions = {
    useFactory: async () => ({
        throttlers: [
            {
                ttl: 60000,
                limit: 50000
            }
        ]
    })
}