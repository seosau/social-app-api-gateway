import { Post } from "src/modules/post/entities/post.entity";
import { addBaseURL } from "./addBaseURL";

export function addBaseURLInPosts(posts: Post[]) {
    const postsWithFullImageUrl = posts.map((post) => ({
        ...post,
        image: addBaseURL(post.image),
        user: {
            ...post.user,
            image: addBaseURL(post.user.image),
        }
    }))
    return postsWithFullImageUrl
}

export function addBaseURLInPost(post: Post) {
    return {
        ...post,
        image: addBaseURL(post.image),
        user: {
            ...post.user,
            image: addBaseURL(post.user.image),
        }
    }
}