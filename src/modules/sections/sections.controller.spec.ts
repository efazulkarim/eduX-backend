import { Test, TestingModule } from '@nestjs/testing';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

describe('SectionsController', () => {
  let controller: SectionsController;
  let service: SectionsService;

  const mockSection = {
    id: 'section-1',
    name: 'A',
    classId: 'class-1',
    departmentId: 'dept-1',
    teacherId: 'teacher-1',
    capacity: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    class: {
      id: 'class-1',
      name: 'Eight',
      grade: 8,
    },
    department: {
      id: 'dept-1',
      name: 'Science',
    },
    teacher: {
      id: 'teacher-1',
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    },
    _count: {
      students: 0,
    },
  };

  const mockSectionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByClass: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionsController],
      providers: [
        {
          provide: SectionsService,
          useValue: mockSectionsService,
        },
      ],
    }).compile();

    controller = module.get<SectionsController>(SectionsController);
    service = module.get<SectionsService>(SectionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createSectionDto: CreateSectionDto = {
      name: 'A',
      classId: 'class-1',
      departmentId: 'dept-1',
      teacherId: 'teacher-1',
      capacity: 30,
    };

    it('should create a section', async () => {
      mockSectionsService.create.mockResolvedValue(mockSection);

      const result = await controller.create(createSectionDto);

      expect(service.create).toHaveBeenCalledWith(createSectionDto);
      expect(result).toEqual(mockSection);
    });
  });

  describe('findAll', () => {
    it('should return paginated sections', async () => {
      const mockResponse = {
        sections: [mockSection],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      mockSectionsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findByClass', () => {
    it('should return sections for a specific class', async () => {
      const mockResponse = {
        sections: [mockSection],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          pages: 1,
        },
      };

      mockSectionsService.findByClass.mockResolvedValue(mockResponse);

      const result = await controller.findByClass('class-1', 'dept-1', {
        page: 1,
        limit: 50,
      });

      expect(service.findByClass).toHaveBeenCalledWith('class-1', 'dept-1', {
        page: 1,
        limit: 50,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return sections without department filter', async () => {
      const mockResponse = {
        sections: [mockSection],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          pages: 1,
        },
      };

      mockSectionsService.findByClass.mockResolvedValue(mockResponse);

      const result = await controller.findByClass('class-1');

      expect(service.findByClass).toHaveBeenCalledWith(
        'class-1',
        undefined,
        undefined,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a section by id', async () => {
      mockSectionsService.findOne.mockResolvedValue(mockSection);

      const result = await controller.findOne('section-1');

      expect(service.findOne).toHaveBeenCalledWith('section-1');
      expect(result).toEqual(mockSection);
    });
  });

  describe('update', () => {
    const updateSectionDto: UpdateSectionDto = {
      name: 'B',
    };

    it('should update a section', async () => {
      const updatedSection = { ...mockSection, ...updateSectionDto };
      mockSectionsService.update.mockResolvedValue(updatedSection);

      const result = await controller.update('section-1', updateSectionDto);

      expect(service.update).toHaveBeenCalledWith(
        'section-1',
        updateSectionDto,
      );
      expect(result).toEqual(updatedSection);
    });
  });

  describe('remove', () => {
    it('should delete a section', async () => {
      mockSectionsService.remove.mockResolvedValue(mockSection);

      const result = await controller.remove('section-1');

      expect(service.remove).toHaveBeenCalledWith('section-1');
      expect(result).toEqual(mockSection);
    });
  });
});
