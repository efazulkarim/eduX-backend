import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { DatabaseService } from '../../database/database.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import {
  BulkUpdateSectionDto,
  SectionSetupDto,
} from './dto/bulk-update-section.dto';

describe('SectionsService', () => {
  let service: SectionsService;
  let mockDbService: {
    section: {
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
    department: {
      findUnique: jest.Mock;
    };
    teacher: {
      findUnique: jest.Mock;
    };
    student: {
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockClass = {
    id: 'class-1',
    name: 'Eight',
    medium: 'BANGLA',
  };

  const mockDepartment = {
    id: 'dept-1',
    name: 'Science',
  };

  const mockTeacher = {
    id: 'teacher-1',
    userId: 'user-1',
    employeeId: 'EMP001',
  };

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
    class: mockClass,
    department: mockDepartment,
    teacher: mockTeacher,
    _count: {
      students: 0,
    },
  };

  beforeEach(async () => {
    mockDbService = {
      section: {
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
      department: {
        findUnique: jest.fn(),
      },
      teacher: {
        findUnique: jest.fn(),
      },
      student: {
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);
  });

  describe('create', () => {
    const createSectionDto: CreateSectionDto = {
      name: 'A',
      classId: 'class-1',
      departmentId: 'dept-1',
      teacherId: 'teacher-1',
      capacity: 30,
    };

    it('should create a section successfully', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findUnique.mockResolvedValue(mockDepartment);
      mockDbService.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockDbService.section.findFirst.mockResolvedValue(null);
      mockDbService.section.create.mockResolvedValue(mockSection);

      const result = await service.create(createSectionDto);

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: createSectionDto.classId },
      });
      expect(mockDbService.department.findUnique).toHaveBeenCalledWith({
        where: { id: createSectionDto.departmentId },
      });
      expect(mockDbService.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: createSectionDto.teacherId },
      });
      expect(result).toEqual(mockSection);
    });

    it('should throw NotFoundException when class not found', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.create(createSectionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when department not found', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findUnique.mockResolvedValue(null);

      await expect(service.create(createSectionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when teacher not found', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findUnique.mockResolvedValue(mockDepartment);
      mockDbService.teacher.findUnique.mockResolvedValue(null);

      await expect(service.create(createSectionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for duplicate section', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findUnique.mockResolvedValue(mockDepartment);
      mockDbService.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockDbService.section.findFirst.mockResolvedValue(mockSection);

      await expect(service.create(createSectionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated sections', async () => {
      const mockSections = [mockSection];
      const mockTotal = 1;

      mockDbService.section.findMany.mockResolvedValue(mockSections);
      mockDbService.section.count.mockResolvedValue(mockTotal);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        sections: mockSections,
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          pages: 1,
        },
      });
    });
  });

  describe('findByClass', () => {
    it('should return sections for a specific class', async () => {
      const mockSections = [mockSection];
      const mockTotal = 1;

      mockDbService.section.findMany.mockResolvedValue(mockSections);
      mockDbService.section.count.mockResolvedValue(mockTotal);

      const result = await service.findByClass('class-1', 'dept-1', {
        page: 1,
        limit: 50,
      });

      expect(mockDbService.section.findMany).toHaveBeenCalledWith({
        where: { classId: 'class-1', departmentId: 'dept-1' },
        skip: 0,
        take: 50,
        include: {
          class: true,
          department: true,
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
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual({
        sections: mockSections,
        pagination: {
          page: 1,
          limit: 50,
          total: mockTotal,
          pages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a section by id', async () => {
      const mockSectionWithDetails = {
        ...mockSection,
        students: [],
        subjects: [],
        _count: {
          students: 0,
          subjects: 0,
        },
      };

      mockDbService.section.findUnique.mockResolvedValue(
        mockSectionWithDetails,
      );

      const result = await service.findOne('section-1');

      expect(mockDbService.section.findUnique).toHaveBeenCalledWith({
        where: { id: 'section-1' },
        include: {
          class: true,
          department: true,
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          students: {
            take: 20,
            include: {
              attendances: {
                take: 5,
                orderBy: { date: 'desc' },
              },
            },
            orderBy: { rollNumber: 'asc' },
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
            },
          },
          _count: {
            select: {
              students: true,
              subjects: true,
            },
          },
        },
      });
      expect(result).toEqual(mockSectionWithDetails);
    });

    it('should throw NotFoundException when section not found', async () => {
      mockDbService.section.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateSectionDto: UpdateSectionDto = {
      name: 'B',
    };

    it('should update a section successfully', async () => {
      const updatedSection = { ...mockSection, ...updateSectionDto };

      mockDbService.section.findUnique.mockResolvedValue(mockSection);
      mockDbService.section.findFirst.mockResolvedValue(null);
      mockDbService.section.update.mockResolvedValue(updatedSection);

      const result = await service.update('section-1', updateSectionDto);

      expect(mockDbService.section.update).toHaveBeenCalledWith({
        where: { id: 'section-1' },
        data: updateSectionDto,
        include: {
          class: true,
          department: true,
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
      });
      expect(result).toEqual(updatedSection);
    });

    it('should throw NotFoundException when section not found', async () => {
      mockDbService.section.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateSectionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for duplicate section name', async () => {
      mockDbService.section.findUnique.mockResolvedValue(mockSection);
      mockDbService.section.findFirst.mockResolvedValue({ id: 'section-2' });

      await expect(
        service.update('section-1', updateSectionDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a section successfully', async () => {
      mockDbService.section.findUnique.mockResolvedValue(mockSection);
      mockDbService.student.count.mockResolvedValue(0);
      mockDbService.section.delete.mockResolvedValue(mockSection);

      const result = await service.remove('section-1');

      expect(mockDbService.student.count).toHaveBeenCalledWith({
        where: { sectionId: 'section-1' },
      });
      expect(mockDbService.section.delete).toHaveBeenCalledWith({
        where: { id: 'section-1' },
      });
      expect(result).toEqual(mockSection);
    });

    it('should throw BadRequestException when section has students', async () => {
      mockDbService.section.findUnique.mockResolvedValue(mockSection);
      mockDbService.student.count.mockResolvedValue(5);

      await expect(service.remove('section-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when section not found', async () => {
      mockDbService.section.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setupSections', () => {
    const sectionSetupDto: SectionSetupDto = {
      classId: 'class-1',
      departmentId: 'dept-1',
      sectionConfigs: [
        { id: 'section-1', name: 'A', isActive: true, teacherId: 'teacher-1' },
        { name: 'B', isActive: true, teacherId: undefined },
      ],
    };

    it('should setup sections successfully', async () => {
      const mockSections = [mockSection];
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findUnique.mockResolvedValue(mockDepartment);
      mockDbService.$transaction.mockResolvedValue([]);
      mockDbService.section.findMany.mockResolvedValue(mockSections);

      const result = await service.setupSections(sectionSetupDto);

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.department.findUnique).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
      });
      expect(mockDbService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockSections);
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.setupSections(sectionSetupDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-existent department', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.department.findUnique.mockResolvedValue(null);

      await expect(service.setupSections(sectionSetupDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bulkUpdate', () => {
    const bulkUpdateDto: BulkUpdateSectionDto = {
      sectionIds: ['section-1', 'section-2'],
      isActive: true,
    };

    it('should bulk update sections successfully', async () => {
      const mockSections = [mockSection];
      mockDbService.section.findMany.mockResolvedValueOnce([
        { id: 'section-1' },
        { id: 'section-2' },
      ]);
      mockDbService.section.updateMany.mockResolvedValue({ count: 2 });
      mockDbService.section.findMany.mockResolvedValueOnce(mockSections);

      const result = await service.bulkUpdate(bulkUpdateDto);

      expect(mockDbService.section.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['section-1', 'section-2'] } },
        data: { isActive: true },
      });
      expect(result).toEqual(mockSections);
    });

    it('should throw BadRequestException for non-existent sections', async () => {
      mockDbService.section.findMany.mockResolvedValue([{ id: 'section-1' }]);

      await expect(service.bulkUpdate(bulkUpdateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetSections', () => {
    it('should reset sections to inactive', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.section.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.resetSections('class-1', 'dept-1');

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.section.updateMany).toHaveBeenCalledWith({
        where: { classId: 'class-1', departmentId: 'dept-1' },
        data: { isActive: false },
      });
      expect(result).toEqual({
        message: 'Sections have been reset to inactive status',
      });
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.resetSections('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
