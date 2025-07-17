import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  BulkUpdateDepartmentDto,
  DepartmentSetupDto,
} from './dto/bulk-update-department.dto';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: DepartmentsService;

  const mockDepartment = {
    id: 'dept-1',
    name: 'Science',
    description: 'Science department',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [],
    _count: {
      sections: 0,
      subjects: 0,
    },
  };

  const mockDepartmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByClass: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setupDepartments: jest.fn(),
    bulkUpdate: jest.fn(),
    resetDepartments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: mockDepartmentsService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDepartmentDto: CreateDepartmentDto = {
      name: 'Science',
      description: 'Science department',
    };

    it('should create a department', async () => {
      mockDepartmentsService.create.mockResolvedValue(mockDepartment);

      const result = await controller.create(createDepartmentDto);

      expect(service.create).toHaveBeenCalledWith(createDepartmentDto);
      expect(result).toEqual(mockDepartment);
    });
  });

  describe('findAll', () => {
    it('should return paginated departments', async () => {
      const mockResponse = {
        departments: [mockDepartment],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      mockDepartmentsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findByClass', () => {
    it('should return departments for a specific class', async () => {
      const mockDepartments = [mockDepartment];
      mockDepartmentsService.findByClass.mockResolvedValue(mockDepartments);

      const result = await controller.findByClass('class-1');

      expect(service.findByClass).toHaveBeenCalledWith('class-1');
      expect(result).toEqual(mockDepartments);
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      mockDepartmentsService.findOne.mockResolvedValue(mockDepartment);

      const result = await controller.findOne('dept-1');

      expect(service.findOne).toHaveBeenCalledWith('dept-1');
      expect(result).toEqual(mockDepartment);
    });
  });

  describe('update', () => {
    const updateDepartmentDto: UpdateDepartmentDto = {
      name: 'Business Studies',
    };

    it('should update a department', async () => {
      const updatedDepartment = { ...mockDepartment, ...updateDepartmentDto };
      mockDepartmentsService.update.mockResolvedValue(updatedDepartment);

      const result = await controller.update('dept-1', updateDepartmentDto);

      expect(service.update).toHaveBeenCalledWith(
        'dept-1',
        updateDepartmentDto,
      );
      expect(result).toEqual(updatedDepartment);
    });
  });

  describe('remove', () => {
    it('should delete a department', async () => {
      mockDepartmentsService.remove.mockResolvedValue(mockDepartment);

      const result = await controller.remove('dept-1');

      expect(service.remove).toHaveBeenCalledWith('dept-1');
      expect(result).toEqual(mockDepartment);
    });
  });

  describe('setupDepartments', () => {
    const departmentSetupDto: DepartmentSetupDto = {
      classId: 'class-1',
      departmentConfigs: [
        { id: 'dept-1', isActive: true },
        { id: 'dept-2', isActive: false },
      ],
    };

    it('should setup departments for a class', async () => {
      const mockResponse = [mockDepartment];
      mockDepartmentsService.setupDepartments.mockResolvedValue(mockResponse);

      const result = await controller.setupDepartments(departmentSetupDto);

      expect(service.setupDepartments).toHaveBeenCalledWith(departmentSetupDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('bulkUpdate', () => {
    const bulkUpdateDto: BulkUpdateDepartmentDto = {
      departmentIds: ['dept-1', 'dept-2'],
      isActive: true,
    };

    it('should bulk update departments', async () => {
      const mockResponse = [mockDepartment];
      mockDepartmentsService.bulkUpdate.mockResolvedValue(mockResponse);

      const result = await controller.bulkUpdate(bulkUpdateDto);

      expect(service.bulkUpdate).toHaveBeenCalledWith(bulkUpdateDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetDepartments', () => {
    it('should reset departments for a class', async () => {
      const mockResponse = {
        message: 'All departments have been reset to inactive status',
      };
      mockDepartmentsService.resetDepartments.mockResolvedValue(mockResponse);

      const result = await controller.resetDepartments('class-1');

      expect(service.resetDepartments).toHaveBeenCalledWith('class-1');
      expect(result).toEqual(mockResponse);
    });
  });
});
