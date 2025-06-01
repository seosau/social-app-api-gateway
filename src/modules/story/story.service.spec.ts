// import { StoryService } from "./story.service"
// import { PrismaService } from '../../config/database/prisma/prisma.service';
// import { Logger } from 'nestjs-pino';
// import { Test, TestingModule } from "@nestjs/testing";
// import { CACHE_MANAGER } from "@nestjs/cache-manager";
// import { UpdateStoryDto } from "./dto/update-story.dto";
// import { CreateStoryDto } from "./dto/create-story.dto";

// describe('StoryController', () => {
//     let storyService: StoryService

//     const mockPrisma = {
//         story: {
//             create: jest.fn(),
//             findMany: jest.fn(),
//             findFirst: jest.fn(),
//             update: jest.fn(),
//             delete: jest.fn()
//         }
//     }

//     const mockCacheManager = {
//         get: jest.fn(),
//         set: jest.fn()
//     }

//     const mockClientProxy = {
//         emit: jest.fn(),
//     }

//     const mockLogger = {
//         log: jest.fn(),
//         error: jest.fn()
//     }

//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 StoryService,
//                 { provide: PrismaService, useValue: mockPrisma },
//                 { provide: CACHE_MANAGER, useValue: mockCacheManager },
//                 { provide: 'RABBITMQ_SERVICE', useValue: mockClientProxy },
//                 { provide: Logger, useValue: mockLogger },
//             ],
//         }).compile();

//         storyService = module.get<StoryService>(StoryService)
//     })

//     it('should be defined', () => {
//         expect(storyService).toBeDefined();
//     })

//     describe('create', () => {
//         it('should throw error if userId not valid', async () => {
//             const dto: CreateStoryDto = {image: 'img.jpg', userId: ''}
//             await expect(storyService.create(dto)).rejects.toThrow('UserId is required')
//         })
//         it('should log and throw if DB fails', async () => {
//             const dto: CreateStoryDto = {image: 'img.jpg', userId: '1'}

//             const error = new Error('DB fail')

//             mockPrisma.story.create.mockRejectedValue(error)

//             await expect(storyService.create(dto)).rejects.toThrow('DB error')
//             expect(mockLogger.error).toHaveBeenCalledWith('Failed to create', error)
//         })
//         it('should create a story and emit event', async () => {
//             const dto = {image: 'img.jpg', userId: '1'};
//             const created = {id: '1', ...dto}
//             mockPrisma.story.create.mockResolvedValue(created)

//             const res = await storyService.create(dto);

//             expect(mockPrisma.story.create).toHaveBeenCalledWith({data: dto})
//             expect(mockClientProxy.emit).toHaveBeenCalledWith('story.created', created);
//             expect(res).toEqual(created)
//         })
//     })

//     describe('findAll', () => {
//         it('should return cached stories if exists', async() => {
//             const cached = [{id: '1', image: 'img.jpg', userId: '1'}]
//             mockCacheManager.get.mockResolvedValue(cached)

//             const result = await storyService.findAll()

//             expect(mockCacheManager.get).toHaveBeenCalled()
//             expect(result).toEqual(cached)
//         })
//         it('should return DB reault and emit if no cache', async () => {
//             mockCacheManager.get.mockResolvedValue(null)
//             const stories = [{id: '1', image: 'img.jpg', userId: '1'}]
//             mockPrisma.story.findMany.mockResolvedValue(stories)

//             const result = await storyService.findAll()

//             expect(mockCacheManager.get).toHaveBeenCalled()
//             expect(mockPrisma.story.findMany).toHaveBeenCalled()
//             expect(mockClientProxy.emit).toHaveBeenCalledWith('story.getted', stories)
//             expect(result).toEqual(stories)
//         })
//     })

//     describe('findOne', () => {
//         it('should return cached story if exists', async() => {
//             const story = {id: '1', image: 'img.jpg', userId: '1'}
//             mockCacheManager.get.mockResolvedValue(story)

//             const result = await storyService.findOne('1')

//             expect(mockCacheManager.get).toHaveBeenCalled()
//             expect(result).toEqual(story)
//         })
//         it('should return DB story and emit if no cache', async() => {
//             mockCacheManager.get.mockResolvedValue(null)
//             const story = {id: '1', image: 'img.jpg', userId: '1'}
//             mockPrisma.story.findFirst.mockResolvedValue(story);

//             const result = await storyService.findOne('1')

//             expect(mockCacheManager.get).toHaveBeenCalled()
//             expect(mockPrisma.story.findFirst).toHaveBeenCalledWith({
//                 where: { id: '1'}
//             })
//             expect(mockClientProxy.emit).toHaveBeenCalledWith('story.getted', story)
//             expect(result).toEqual(story)
//         })
//     })

//     describe('update', () => {
//         it('should update and emit event', async () => {
//             const dto: UpdateStoryDto = { image: 'updated.jpg', userId: '1'}
//             const updated = {id: '1', ...dto}
//             mockPrisma.story.update.mockResolvedValue(updated)

//             const result = await storyService.update('1', dto)

//             expect(mockPrisma.story.update).toHaveBeenCalledWith({
//                 where: { id: '1' },
//                 data: {
//                     image: dto.image
//                 }
//             })
//             expect(mockClientProxy.emit).toHaveBeenCalledWith('story.updated', updated)
//             expect(result).toEqual(updated)
//         })
//     })

//     describe('remove', () => {
//         it('should remove and emit event', async() => {
//             const removed = {id: '1', image: 'img.jpg', userId: '1'}
//             mockPrisma.story.delete.mockResolvedValue(removed)

//             const result = await storyService.remove('1')

//             expect(mockPrisma.story.delete).toHaveBeenCalledWith({
//                 where: { id: '1' }
//             })
//             expect(mockClientProxy.emit).toHaveBeenCalledWith('story.deleted', removed)
//             expect(result).toEqual(removed)
//         })
//     })
// })