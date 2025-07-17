import { User } from "src/modules/user/entities/user.entity";
import { addBaseURL } from "./addBaseURL";

export function addBaseURLInUser (user: User) {
    return {
        ...user,
        image: addBaseURL(user.image)
    }
}

export function addBaseURLInUsers(users: User[]) {
    const usersWithFullImageUrl = users.map((user) => ({
        ...user,
        image: addBaseURL(user.image),
    }))
    return usersWithFullImageUrl
}