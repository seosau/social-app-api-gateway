export const RESIZE_IMAGE = 'resize_image'
export const UPLOAD_IMAGE = 'upload_image'

export const TOGGLE_LIKE = 'toggle_like'
export const LIKE_COUNT = 'like_count'
export const COMMENT_COUNT = 'comment_count'
export const COMMENT_COUNT_TYPE = {
    CREATE: 'create',
    DELETE: 'delete'
}
export type COMMENT_COUNT_TYPE_ARGUMENT = 'create' | 'delete'
export const UPLOAD_IMAGE_TYPE = {
    POST: 'post',
    USER: 'user',
    STORY: 'story'
}