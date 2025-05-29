export const STORY_CACHE_KEYS = {
    ALL_STORIES: 'stories:all',
    STORY_BY_ID: (storyId: string) => `story:${storyId}`,
    STORYS_BY_USER: (userId: string) => `story:${userId}`,
}

export const STORY_UPDATE_CACHE_OPTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
}

import { story } from '@prisma/client';
import { Cache } from 'cache-manager';

export const updateCaches = async (updateOption: string, userId: string, storyWithUrl, cacheManager: Cache) => {
    const cacheAllStories = (await cacheManager.get(STORY_CACHE_KEYS.ALL_STORIES)) as story[] || [];
    if(cacheAllStories.length > 0) {
        switch (updateOption){
        case STORY_UPDATE_CACHE_OPTIONS.CREATE: {
            const newCacheAllStories = [storyWithUrl, ...cacheAllStories];
            await cacheManager.set(STORY_CACHE_KEYS.ALL_STORIES, newCacheAllStories);
            break;
        }
        case STORY_UPDATE_CACHE_OPTIONS.UPDATE: {
            const newCacheAllStories = cacheAllStories.map(s => s.id === storyWithUrl.id? storyWithUrl : s);
            await cacheManager.set(STORY_CACHE_KEYS.ALL_STORIES, newCacheAllStories);
            break;
        }
        case STORY_UPDATE_CACHE_OPTIONS.DELETE: {
            const newCacheAllStories = cacheAllStories.filter(s => s.id !== storyWithUrl.id);
            await cacheManager.set(STORY_CACHE_KEYS.ALL_STORIES, newCacheAllStories);
            break;
        }
        }
    } 
    const cacheStoriesId = await cacheManager.get(STORY_CACHE_KEYS.STORY_BY_ID(storyWithUrl.id)) as story;
    if(cacheStoriesId) {
        switch (updateOption){
        // case STORY_UPDATE_CACHE_OPTIONS.CREATE: {
        //     const newCacheStoriesId = [storyWithUrl, ...cacheStoriesId];
        //     await cacheManager.set(STORY_CACHE_KEYS.STORY_BY_ID(storyWithUrl.id), newCacheStoriesId);
        //     break;
        // }
        case STORY_UPDATE_CACHE_OPTIONS.UPDATE: {
            const newCacheStoriesId = Object.assign(cacheStoriesId, storyWithUrl)
            await cacheManager.set(STORY_CACHE_KEYS.STORY_BY_ID(storyWithUrl.id), newCacheStoriesId);
            break;
        }
        case STORY_UPDATE_CACHE_OPTIONS.DELETE: {
            await cacheManager.del(STORY_CACHE_KEYS.STORY_BY_ID(storyWithUrl.id));
            break;
        }
        }
    } else {
        await cacheManager.set(STORY_CACHE_KEYS.STORY_BY_ID(storyWithUrl.id), storyWithUrl);
    }
    const cacheStoriesUser = (await cacheManager.get(STORY_CACHE_KEYS.STORYS_BY_USER(userId))) as story[] || [];
    if(cacheStoriesUser.length > 0) {
        switch (updateOption){
        case STORY_UPDATE_CACHE_OPTIONS.CREATE: {
            const newCacheStoriesUser = [storyWithUrl, ...cacheStoriesUser];
            await cacheManager.set(STORY_CACHE_KEYS.STORYS_BY_USER(userId), newCacheStoriesUser);
            break;
        }
        case STORY_UPDATE_CACHE_OPTIONS.UPDATE: {
            const newCacheStoriesUser = cacheStoriesUser.map(s => s.id === storyWithUrl.id? storyWithUrl : s)
            await cacheManager.set(STORY_CACHE_KEYS.STORYS_BY_USER(userId), newCacheStoriesUser);
            break;
        }
        case STORY_UPDATE_CACHE_OPTIONS.DELETE: {
            const newCacheStoriesUser = cacheStoriesUser.filter(s => s.id !== storyWithUrl.id)
            await cacheManager.set(STORY_CACHE_KEYS.STORYS_BY_USER(userId), newCacheStoriesUser);
            break;
        }
        }
    }
}