export function addBaseURL (imageName: string): string {
    if(imageName && (imageName.startsWith('http://') || imageName.startsWith('https://'))) return imageName
    const BASE_IMG_URL = process.env.BASE_IMG_URL;
    const result = imageName ? `${BASE_IMG_URL}/${imageName}` : '';
    return result;
}