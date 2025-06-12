import { GetCommentsRequest } from "src/generated/comment";

export class GetCommentDto implements GetCommentsRequest{
    postId: string;
}