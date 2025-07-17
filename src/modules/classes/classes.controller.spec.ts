import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { BulkUpdateClassDto, ClassSetupDto } from './dto/bulk-update-class.dto';
import { Medium } from './dto/create-class.dto';

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: ClassesService;

  const mockClass = {
    id: 'class-1',
    name: 'One',
    medium: Medium.BANGLA,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [],
    _count: {
      sections: 0,
    },
  };

  const mockClassesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getClassesByMedium: jest.fn(),
    setupClasses: jest.fn(),
    bulkUpdate: jest.fn(),
    resetClasses: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: mockClassesService,
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    service = module.get<ClassesService>(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createClassDto: CreateClassDto = {
      name: 'One',
      medium: Medium.BANGLA,
    };

    it('should create a class', async () => {
      mockClassesService.create.mockResolvedValue(mockClass);

      const result = await controller.create(createClassDto);

      expect(service.create).toHaveBeenCalledWith(createClassDto);
      expect(result).toEqual(mockClass);
    });
  });

  describe('findAll', () => {
    it('should return paginated classes', async () => {
      const mockResponse = {
        classes: [mockClass],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      mockClassesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getClassesByMedium', () => {
    it('should return classes filtered by medium', async () => {
      const mockClasses = [mockClass];
      mockClassesService.getClassesByMedium.mockResolvedValue(mockClasses);

      const result = await controller.getClassesByMedium(Medium.BANGLA);

      expect(service.getClassesByMedium).toHaveBeenCalledWith(Medium.BANGLA);
      expect(result).toEqual(mockClasses);
    });

    it('should return all classes when no medium specified', async () => {
      const mockClasses = [mockClass];
      mockClassesService.getClassesByMedium.mockResolvedValue(mockClasses);

      const result = await controller.getClassesByMedium();

      expect(service.getClassesByMedium).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockClasses);
    });
  });

  describe('findOne', () => {
    it('should return a class by id', async () => {
      mockClassesService.findOne.mockResolvedValue(mockClass);

      const result = await controller.findOne('class-1');

      expect(service.findOne).toHaveBeenCalledWith('class-1');
      expect(result).toEqual(mockClass);
    });
  });

  describe('update', () => {
    const updateClassDto: UpdateClassDto = {
      name: 'Two',
    };

    it('should update a class', async () => {
      const updatedClass = { ...mockClass, ...updateClassDto };
      mockClassesService.update.mockResolvedValue(updatedClass);

      const result = await controller.update('class-1', updateClassDto);

      expect(service.update).toHaveBeenCalledWith('class-1', updateClassDto);
      expect(result).toEqual(updatedClass);
    });
  });

  describe('remove', () => {
    it('should delete a class', async () => {
      mockClassesService.remove.mockResolvedValue(mockClass);

      const result = await controller.remove('class-1');

      expect(service.remove).toHaveBeenCalledWith('class-1');
      expect(result).toEqual(mockClass);
    });
  });

  describe('setupClasses', () => {
    const classSetupDto: ClassSetupDto = {
      medium: 'BANGLA',
      classConfigs: [
        { id: 'class-1', isActive: true },
        { id: 'class-2', isActive: false },
      ],
    };

    it('should setup classes with bulk configuration', async () => {
      const mockResponse = [mockClass];
      mockClassesService.setupClasses.mockResolvedValue(mockResponse);

      const result = await controller.setupClasses(classSetupDto);

      expect(service.setupClasses).toHaveBeenCalledWith(classSetupDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('bulkUpdate', () => {
    const bulkUpdateDto: BulkUpdateClassDto = {
      classIds: ['class-1', 'class-2'],
      isActive: true,
    };

    it('should bulk update classes', async () => {
      const mockResponse = [mockClass];
      mockClassesService.bulkUpdate.mockResolvedValue(mockResponse);

      const result = await controller.bulkUpdate(bulkUpdateDto);

      expect(service.bulkUpdate).toHaveBeenCalledWith(bulkUpdateDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetClasses', () => {
    it('should reset all classes to inactive', async () => {
      const mockResponse = {
        message: 'All classes have been reset to inactive status',
      };
      mockClassesService.resetClasses.mockResolvedValue(mockResponse);

      const result = await controller.resetClasses();

      expect(service.resetClasses).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
