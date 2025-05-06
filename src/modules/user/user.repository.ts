import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
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
}