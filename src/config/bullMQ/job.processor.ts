import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker } from "bullmq";
import * as gm from 'gm';


const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);
@Injectable()
export class JobProcessor implements OnModuleInit {
    onModuleInit() {
        // const worker = new Worker(
        //     'example-job',
        //     async (job) => {
        //         console.log('Processing job: ', job.name, job.data)
        //     },
        //     {
        //         connection: {
        //             host: 'redis',
        //             port: 6379
        //         }
        //     }
        // )
        const worker = new Worker(
            'resize-image',
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
            { connection: { 
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
                password: process.env.REDIS_PASSWORD,
                username: process.env.REDIS_USERNAME
             }}
          );
    }
}