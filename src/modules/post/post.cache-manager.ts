export const POST_CACHE_KEYS = {
    ALL_POSTS: 'posts:all',
    POST_BY_ID: (postId: string) => `post:${postId}`,
    POSTS_BY_USER: (userId: string) => `post${userId}`,
}

export const POST_UPDATE_CACHE_OPTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
}