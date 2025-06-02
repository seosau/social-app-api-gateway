import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }
    
    async imageUpload(filePath: string): Promise<string>{
        try{
            const imageUrl = await cloudinary.uploader.upload('./upload/' + filePath, {
                folder: 'upload'
            })
            return imageUrl.secure_url            
        } catch(err) {
            console.error('Upload to cloud error: ', err)
            throw err
        }
    }
}