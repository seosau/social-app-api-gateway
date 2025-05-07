export const POST_CACHE_KEYS = {
    ALL_POSTS: 'posts:all',
    POST_BY_ID: (postId: string) => `post:${postId}`,
    POSTS_BY_USER: (userId: string) => `post${userId}`,
}