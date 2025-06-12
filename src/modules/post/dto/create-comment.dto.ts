import { CreateCommentRequest } from "src/generated/comment";

export class CreateCommentDto implements CreateCommentRequest{
    postId: string;
    userId: string;
    content: string;
    parentId?: string;
}