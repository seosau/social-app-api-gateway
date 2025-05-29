import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { softDeleteMiddleware } from "./middlewares/softDelete.middleware";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
        // this.$use(softDeleteMiddleware)
    }
}