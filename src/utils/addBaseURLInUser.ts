import { User } from "src/modules/user/entities/user.entity";
import { addBaseURL } from "./addBaseURL";

export function addBaseURLInUser (user: User) {
    return {
        ...user,
        image: addBaseURL(user.image)
    }
}