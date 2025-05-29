import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { POST_CACHE_KEYS } from "../post/post.cache-manager";
import { Post } from "../post/entities/post.entity";
import { addBaseURLInUser } from "../../utils/addBaseURLInUser";

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(
        private dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {
        super(User, dataSource.createEntityManager());
    }
    async updateCaches (userId: string) {
        await this.cacheManager.set(POST_CACHE_KEYS.ALL_POSTS, []);
        await this.cacheManager.set(POST_CACHE_KEYS.POSTS_BY_USER(userId), []);
    }

    async findById(id: string) {
        return this.findOne({where: {id: id}});
    }

    async findByIdWithLikedPostsRelations(id: string) {
        return this.findOne({
            where: {id: id},
            relations: ['likedPosts']
        });
    }

    async findByEmail(email: string) {
        return this.findOne({
            where: {
                email: email
            }
        })
    }

    async findByEmailAndPassword(email: string, password: string) {
        return this.findOne({
            where: {
                email: email,
                password: password
            }
        })
    }

    async saveUser (user: User) {
        const savedUser = await this.save(user);
        await this.updateCaches(savedUser.id);
        return addBaseURLInUser(savedUser);
    }
}