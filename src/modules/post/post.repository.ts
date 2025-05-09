import { DataSource, ILike, In, Repository } from "typeorm";
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
        return await this.save(post);
    }

    async findAllWithRelations() {
        return this.find({
            relations: ['user', 'likedBy'],
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async findAllByUser(userId: string) {
        return this.find({
            where: {user: {id: userId}},
            relations: ['user','likedBy'],
            order: {
                createdAt: 'DESC'
            }
          })
    }

    async findById(id: string) {
        return this.findOne({
            where: {id: id},
            relations: ['user','likedBy'],
        })
    }

    async findByIds(ids: (string | undefined)[]) {
        return this.find({
            where: {
                id: In(ids)
            },
            relations: ['user','likedBy'],
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async findOneWithAllRelations(id: string) {
        return this.findOne({
            relations: ['user', 'likedBy'],
            where: {id: id}
          })
    }

    async findByKeyword(keyword: string){
        return this.find({
            where: {content: ILike(`%${keyword}%`)},
            relations: ['user', 'likedBy'],
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async findByKeywordAndUser(keyword: string, userId: string) {
        return this.find({
            where: { 
                content: ILike(`%${keyword}%`),
                user: {id: userId}
            },
            relations: ['user', 'likedBy'],
            order: {
                createdAt: 'DESC'
            }
        })
    }
}