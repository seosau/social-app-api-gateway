import { DataSource, Repository } from "typeorm";
import { Post } from "./entities/post.entity";
import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { User } from "../user/entities/user.entity";

@Injectable()
export class PostRepository extends Repository<Post> {
    constructor(private dataSource: DataSource) {
        super(Post, dataSource.createEntityManager());
    }

    async createPost (createPostDto: CreatePostDto, image: string, user: User) {
        const post = this.create({...createPostDto, image, user});
        return this.save(post);
    }

    async findAllWithRelations() {
        return this.find({
            relations: ['user', 'likedBy']
        })
    }

    async findAllByUser(userId: string) {
        return this.find({
            where: {user: {id: userId}},
            relations: ['user','likedBy'],
          })
    }

    async findById(id: string) {
        return this.findOne({
            where: {id: id}
        })
    }

    async findOneWithUserRelations(id: string) {
        return this.findOne({
            relations: ['user'],
            where: {id: id}
          })
    }
}