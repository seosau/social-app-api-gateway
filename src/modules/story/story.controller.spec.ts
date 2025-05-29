import { Test, TestingModule } from "@nestjs/testing"
import { StoryController } from "./story.controller"
import { StoryService } from "./story.service"
import { JobQueue } from "../../config/bullMQ/job.queue"
import { CreateStoryDto } from "./dto/create-story.dto"
import { UpdateStoryDto } from "./dto/update-story.dto"

describe('StroryController', () => {
    let constroller: StoryController
    let storyService: StoryService

    const mockStoryService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockJobQueue = {
        addResizeJob: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StoryController],
            providers: [
                { provide: StoryService, useValue: mockStoryService},
                { provide: JobQueue, useValue: mockJobQueue},
            ],
        }).compile();

        constroller = module.get<StoryController>(StoryController);
        storyService = module.get<StoryService>(StoryService);
    });

    it('should be defined', () => {
        expect(constroller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create and jobQueue.addResizedJob', async () => {
            const dto: CreateStoryDto = {image: 'img.jpg', userId: '123'}
            const mockFile: Express.Multer.File = {
                path: 'upload/test.png',
            } as any;
            const result = { id: '1', ...dto};
            mockStoryService.create.mockResolvedValue(result)

            const res = await constroller.create(dto, mockFile);

            expect(mockJobQueue.addResizeJob).toHaveBeenCalledWith({
                filePath: 'upload/test.png',
                width: 500,
                height: 500,
                outputPath: './upload/resized_upload/test.png'
            });
            expect(mockStoryService.create).toHaveBeenCalledWith(dto);
            expect(res).toEqual(result);
        })
    })

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            const result = [{id: '1', image: 'a', userId: '1'}];
            mockStoryService.findAll.mockResolvedValue(result);

            const res = await constroller.findAll()

            expect(mockStoryService.findAll).toHaveBeenCalled()
            expect(res).toEqual(result)
        })
    })

    describe('findOne', () => {
        it('should call service.findOne', async () => {
            const id: string = '1'
            const result = {id: '1', image: 'a', userId: '1'};
            mockStoryService.findOne.mockResolvedValue(result)
            
            const res = await constroller.findOne(id)

            expect(mockStoryService.findOne).toHaveBeenCalledWith(id)
            expect(res).toEqual(result)
        })
    })

    describe('update', () => {
        it('should call service.update', async () => {
            const id: string = '1'
            const dto: UpdateStoryDto = {image: 'img.jpg', userId: '1'}
            const result = {id: '1', ...dto}
            mockStoryService.update.mockResolvedValue(result)

            const res = await constroller.update(id, dto)

            expect(mockStoryService.update).toHaveBeenCalledWith(id, dto)
            expect(res).toEqual(result)
        })
    })

    describe('remove', () => {
        it('should call service.remove', async () => {
            const id: string = '1'
            const result = { id: '1', image: 'img.jpg', userId: '1'}
            mockStoryService.remove.mockResolvedValue(result)

            const res = await constroller.remove(id)

            expect(mockStoryService.remove).toHaveBeenCalledWith(id)
            expect(res).toEqual(result)
        })
    })
})