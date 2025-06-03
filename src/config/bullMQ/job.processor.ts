import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker } from "bullmq";
import * as gm from 'gm';
import { LIKE_COUNT, RESIZE_IMAGE, UPLOAD_IMAGE, UPLOAD_IMAGE_TYPE } from "./job.constants";
import { CloudinaryService } from "../../services/cloudinary.service";
import { PostService } from "../../modules/post/post.service";
import { UserService } from "../../modules/user/user.service";
import { StoryService } from "../../modules/story/story.service";
import { UpdatePostDto } from "src/modules/post/dto/update-post.dto";


const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);
@Injectable()
export class JobProcessor implements OnModuleInit {
    private resizeWorker: Worker
    private uploadImageWorker: Worker
    private likeCountWorker: Worker

    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly postService: PostService,
        private readonly userService: UserService,
        private readonly storyService: StoryService
    ) {}

    onModuleInit() {
        const connectionData = { 
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
            username: process.env.REDIS_USERNAME,
            tls: {},
            maxRetriesPerRequest: null,
         }
        this.resizeWorker = new Worker(
            RESIZE_IMAGE,
            async (job) => {
              try {
                console.log('Start Processing job: ', job.name, job.data);
                const ms = Date.now();
                const { filePath, width, height, outputPath } = job.data;
                gm(filePath)
                    .resize(width, height)
                    .write(outputPath, (err) => {
                        if (err) {
                        console.error('Resize error:', err);
                        } else {
                        console.log('Resize success');
                        }
                    });
                console.log('Processed job in: ', Date.now() - ms, ' ms');
              } catch (error) {
                console.error('Error processing resize job:', error);
              }
            },
            { connection: connectionData}
          );
        this.uploadImageWorker = new Worker(
            UPLOAD_IMAGE,
            async (job) => {
              try {
                console.log('Start Processing job: ', job.name, job.data);
                const ms = Date.now();
                const { id, jobType, filePath, width, height, outputPath } = job.data;
                const imageUrl = await this.cloudinaryService.imageUpload(filePath)
                if(imageUrl) {
                  switch(jobType){
                    case UPLOAD_IMAGE_TYPE.POST: {
                      await this.postService.updateImageByBull(id,imageUrl)
                      break
                    }
                    case UPLOAD_IMAGE_TYPE.USER: {
                      await this.userService.updateImageByBull(id,imageUrl)
                      break
                    }
                  }
                }
                console.log('Processed job in: ', Date.now() - ms, ' ms');
              } catch (error) {
                console.error('Error processing resize job:', error);
              }
            },
            { connection: connectionData}
          );
          this.likeCountWorker = new Worker(
            LIKE_COUNT,
            async (job) => {
              try{
                console.log('Start Processing job: ', job.name, job.data);
                const ms = Date.now();
                const { postId, userId, count } = job.data;
                await this.postService.updateLikeCount(postId, count)

                //Create post_liked_by_user
                const user = await this.userService.findOne(userId);
                const post = await this.postService.findById(postId);
                const index = post.likedBy.findIndex(u => u.id === userId);
              
                if (index > -1) {
                  // Unlike
                  post.likedBy.splice(index, 1);
                  await this.postService.updatePostByPost(post);
                } else {
                  // Like
                  post.likedBy.push(user);
                  await this.postService.updatePostByPost(post);
                }                
                console.log('Processed job in: ', Date.now() - ms, ' ms');
              }catch (error) {
                console.error('Error processing resize job:', error)
                throw error
              }
            },
            {
              connection: connectionData
            }
          )
    }
}