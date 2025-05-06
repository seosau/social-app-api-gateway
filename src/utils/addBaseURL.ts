export function addBaseURL (imageName: string): string | null {
    const BASE_IMG_URL = process.env.BASE_IMG_URL;
    const result = imageName ? `${BASE_IMG_URL}/${imageName}` : null;
    return result;
}