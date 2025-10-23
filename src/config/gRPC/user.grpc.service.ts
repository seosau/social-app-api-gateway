import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { GetManyUserRequest, GetManyUserResponse, GetOneUserRequest, GetOneUserResponse, USER_SERVICE_NAME, UserServiceClient } from "../../generated/user";

@Injectable()
export class UserGrpcService {
    private userService: UserServiceClient

    constructor(
        @Inject('USER_CLIENT_GRPC')
        private readonly userClient: ClientGrpc,
    ) {
        this.userService = this.userClient.getService<UserServiceClient>(USER_SERVICE_NAME)
    }

    // async createConversation (data: CreateConversationRequest) {
    //     try {
    //         const res = this.userService.createConversation(data)

    //         const result = await lastValueFrom(res);
    //         return result;
    //     } catch (err) {
    //         console.error('Create Conversation error in Chat GRPC service: ', err)
    //         throw err
    //     }
    // }

    // async getAllConversation(data: GetListConversationRequest) {
    //     try {
    //         const res = this.userService.getListConversation(data)

    //         const result = await lastValueFrom(res);
    //         return result;
    //     } catch (err) {
    //         console.error('Get all Conversation error in Chat GRPC service: ', err)
    //         throw err
    //     }
    // }

    async getOneUser (data: GetOneUserRequest): Promise<GetOneUserResponse> {
        try {
            const res = this.userService.getOneUser(data)
            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Get User error in Chat GRPC service: ', err)
            throw err
        }
    }

    async getManyUser (data: GetManyUserRequest): Promise<GetManyUserResponse> {
        try {
            const res = this.userService.getManyUser(data)
            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Get Many User error in Chat GRPC service: ', err)
            throw err
        }
    }
}