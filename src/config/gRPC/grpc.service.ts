import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { COMMENT_SERVICE_NAME, CommentServiceClient } from "../../generated/comment";
import { CreateCommentDto } from "../../modules/post/dto/create-comment.dto";
import { GetCommentDto } from "src/modules/post/dto/get-comment.dto";

@Injectable()
export class GrpcService {
    private commentService: CommentServiceClient
    constructor(
        @Inject('CLIENT_GRPC')
        private readonly client: ClientGrpc,  
    ){
        this.commentService = this.client.getService<CommentServiceClient>(COMMENT_SERVICE_NAME)
    }

    async createComment (data: CreateCommentDto) {
        const res = this.commentService.createComment(data)
        const result = await lastValueFrom(res)

        if(!result) {
            throw new Error('Create comment error')
        }

        return result
    }

    async getComment (data: GetCommentDto) {
        const res = this.commentService.getComments(data)
        const result = await lastValueFrom(res)

        if(!result.comments) {
            throw new Error('Get comment error')
        }

        return result
    }
}