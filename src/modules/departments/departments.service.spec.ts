import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DatabaseService } from '../../database/database.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  BulkUpdateDepartmentDto,
  DepartmentSetupDto,
} from './dto/bulk-update-department.dto';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let mockDbService: {
    department: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    class: {
      findUnique: jest.Mock;
    };
    section: {
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockClass = {
    id: 'class-1',
    name: 'Eight',
  };

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

  beforeEach(async () => {
    mockDbService = {
      department: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      class: {
        findUnique: jest.fn(),
      },
      section: {
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  describe('create', () => {
    const createDepartmentDto: CreateDepartmentDto = {
      name: 'Science',
      description: 'Science department',
    };

    it('should create a department successfully', async () => {
      mockDbService.department.findFirst.mockResolvedValue(null);
      mockDbService.department.create.mockResolvedValue(mockDepartment);

      const result = await service.create(createDepartmentDto);

      expect(mockDbService.department.findFirst).toHaveBeenCalledWith({
        where: { name: createDepartmentDto.name },
      });
      expect(mockDbService.department.create).toHaveBeenCalledWith({
        data: createDepartmentDto,
        include: {
          sections: true,
          _count: {
            select: {
              sections: true,
              subjects: true,
            },
          },
        },
      });
      expect(result).toEqual(mockDepartment);
    });

    it('should throw BadRequestException for duplicate department name', async () => {
      mockDbService.department.findFirst.mockResolvedValue(mockDepartment);

      await expect(service.create(createDepartmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated departments', async () => {
      const mockDepartments = [mockDepartment];
      const mockTotal = 1;

      mockDbService.department.findMany.mockResolvedValue(mockDepartments);
      mockDbService.department.count.mockResolvedValue(mockTotal);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        departments: mockDepartments,
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          pages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      const mockDepartmentWithDetails = {
        ...mockDepartment,
        sections: [],
        subjects: [],
        _count: {
          sections: 0,
          subjects: 0,
        },
      };

      mockDbService.department.findUnique.mockResolvedValue(
        mockDepartmentWithDetails,
      );

      const result = await service.findOne('dept-1');

      expect(mockDbService.department.findUnique).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
        include: {
          sections: {
            include: {
              class: true,
              teacher: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  students: true,
                },
              },
            },
          },
          subjects: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              class: true,
            },
          },
          _count: {
            select: {
              sections: true,
              subjects: true,
            },
          },
        },
      });
      expect(result).toEqual(mockDepartmentWithDetails);
    });

    it('should throw NotFoundException when department not found', async () => {
      mockDbService.department.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByClass', () => {
    it('should return departments for a specific class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findMany.mockResolvedValue([mockDepartment]);

      const result = await service.findByClass('class-1');

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.department.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              sections: true,
              subjects: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
      expect(result).toEqual([mockDepartment]);
    });

    it('should throw NotFoundException when class not found', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.findByClass('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDepartmentDto: UpdateDepartmentDto = {
      name: 'Business Studies',
    };

    it('should update a department successfully', async () => {
      const updatedDepartment = { ...mockDepartment, ...updateDepartmentDto };

      mockDbService.department.findUnique.mockResolvedValue(mockDepartment);
      mockDbService.department.findFirst.mockResolvedValue(null);
      mockDbService.department.update.mockResolvedValue(updatedDepartment);

      const result = await service.update('dept-1', updateDepartmentDto);

      expect(mockDbService.department.update).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
        data: updateDepartmentDto,
        include: {
          sections: true,
          _count: {
            select: {
              sections: true,
              subjects: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedDepartment);
    });

    it('should throw NotFoundException when department not found', async () => {
      mockDbService.department.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDepartmentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for duplicate department name', async () => {
      mockDbService.department.findUnique.mockResolvedValue(mockDepartment);
      mockDbService.department.findFirst.mockResolvedValue({ id: 'dept-2' });

      await expect(
        service.update('dept-1', updateDepartmentDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a department successfully', async () => {
      mockDbService.department.findUnique.mockResolvedValue(mockDepartment);
      mockDbService.section.count.mockResolvedValue(0);
      mockDbService.department.delete.mockResolvedValue(mockDepartment);

      const result = await service.remove('dept-1');

      expect(mockDbService.section.count).toHaveBeenCalledWith({
        where: {
          departmentId: 'dept-1',
          students: {
            some: {},
          },
        },
      });
      expect(mockDbService.department.delete).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
      });
      expect(result).toEqual(mockDepartment);
    });

    it('should throw BadRequestException when department has sections with students', async () => {
      mockDbService.department.findUnique.mockResolvedValue(mockDepartment);
      mockDbService.section.count.mockResolvedValue(5);

      await expect(service.remove('dept-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when department not found', async () => {
      mockDbService.department.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
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

    it('should setup departments successfully', async () => {
      const mockDepartments = [mockDepartment];
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findMany.mockResolvedValueOnce([
        { id: 'dept-1' },
        { id: 'dept-2' },
      ]);
      mockDbService.$transaction.mockResolvedValue([]);
      mockDbService.department.findMany.mockResolvedValueOnce(mockDepartments);

      const result = await service.setupDepartments(departmentSetupDto);

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.department.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['dept-1', 'dept-2'] } },
        select: { id: true, name: true },
      });
      expect(mockDbService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockDepartments);
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(
        service.setupDepartments(departmentSetupDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-existent departments', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findMany.mockResolvedValue([{ id: 'dept-1' }]);

      await expect(
        service.setupDepartments(departmentSetupDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdate', () => {
    const bulkUpdateDto: BulkUpdateDepartmentDto = {
      departmentIds: ['dept-1', 'dept-2'],
      isActive: true,
    };

    it('should bulk update departments successfully', async () => {
      const mockDepartments = [mockDepartment];
      mockDbService.department.findMany.mockResolvedValueOnce([
        { id: 'dept-1' },
        { id: 'dept-2' },
      ]);
      mockDbService.department.updateMany.mockResolvedValue({ count: 2 });
      mockDbService.department.findMany.mockResolvedValueOnce(mockDepartments);

      const result = await service.bulkUpdate(bulkUpdateDto);

      expect(mockDbService.department.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['dept-1', 'dept-2'] } },
        data: { isActive: true },
      });
      expect(result).toEqual(mockDepartments);
    });

    it('should throw BadRequestException for non-existent departments', async () => {
      mockDbService.department.findMany.mockResolvedValue([{ id: 'dept-1' }]);

      await expect(service.bulkUpdate(bulkUpdateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetDepartments', () => {
    it('should reset all departments to inactive', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.resetDepartments('class-1');

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.department.updateMany).toHaveBeenCalledWith({
        data: { isActive: false },
      });
      expect(result).toEqual({
        message: 'All departments have been reset to inactive status',
      });
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.resetDepartments('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
