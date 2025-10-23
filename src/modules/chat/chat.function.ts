import { User } from "../../generated/user";
import { SUser } from "../../generated/shared_message";

export function reflectUserToSUser (object: User): SUser {
    const result: User = {
        id: object.id,
        fullName: object.fullName,
        email: object.email,
        password: '',
        image: object.image,
        posts: [],
        likedPosts: [],
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        deletedAt: object.deletedAt,
    }

    return result;
}