import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { DatabaseService } from '../../database/database.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { BulkUpdateClassDto, ClassSetupDto } from './dto/bulk-update-class.dto';
import { Medium } from './dto/create-class.dto';

describe('ClassesService', () => {
  let service: ClassesService;
  let mockDbService: {
    class: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    student: {
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

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

  beforeEach(async () => {
    mockDbService = {
      class: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      student: {
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  describe('create', () => {
    const createClassDto: CreateClassDto = {
      name: 'One',
      medium: Medium.BANGLA,
    };

    it('should create a class successfully', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);
      mockDbService.class.create.mockResolvedValue(mockClass);

      const result = await service.create(createClassDto);

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { name: createClassDto.name },
      });
      expect(mockDbService.class.create).toHaveBeenCalledWith({
        data: createClassDto,
        include: {
          sections: true,
          _count: {
            select: {
              sections: true,
            },
          },
        },
      });
      expect(result).toEqual(mockClass);
    });

    it('should throw BadRequestException for duplicate class name', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);

      await expect(service.create(createClassDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { name: createClassDto.name },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated classes', async () => {
      const mockClasses = [mockClass];
      const mockTotal = 1;

      mockDbService.class.findMany.mockResolvedValue(mockClasses);
      mockDbService.class.count.mockResolvedValue(mockTotal);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        classes: mockClasses,
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          pages: 1,
        },
      });
    });

    it('should use default pagination values', async () => {
      mockDbService.class.findMany.mockResolvedValue([]);
      mockDbService.class.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockDbService.class.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          sections: {
            include: {
              _count: {
                select: {
                  students: true,
                },
              },
            },
          },
          _count: {
            select: {
              sections: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a class by id', async () => {
      const mockClassWithDetails = {
        ...mockClass,
        sections: [],
        subjects: [],
        _count: {
          sections: 0,
          subjects: 0,
        },
      };

      mockDbService.class.findUnique.mockResolvedValue(mockClassWithDetails);

      const result = await service.findOne('class-1');

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
        include: {
          sections: {
            include: {
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
              department: true,
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
      expect(result).toEqual(mockClassWithDetails);
    });

    it('should throw NotFoundException when class not found', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateClassDto: UpdateClassDto = {
      name: 'Two',
    };

    it('should update a class successfully', async () => {
      const updatedClass = { ...mockClass, ...updateClassDto };

      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.class.update.mockResolvedValue(updatedClass);

      const result = await service.update('class-1', updateClassDto);

      expect(mockDbService.class.update).toHaveBeenCalledWith({
        where: { id: 'class-1' },
        data: updateClassDto,
        include: {
          sections: true,
          _count: {
            select: {
              sections: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedClass);
    });

    it('should throw BadRequestException for duplicate name', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.class.findFirst.mockResolvedValue({ id: 'class-2' });

      await expect(service.update('class-1', updateClassDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when class not found', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateClassDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a class successfully', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.student.count.mockResolvedValue(0);
      mockDbService.class.delete.mockResolvedValue(mockClass);

      const result = await service.remove('class-1');

      expect(mockDbService.student.count).toHaveBeenCalledWith({
        where: {
          section: {
            classId: 'class-1',
          },
        },
      });
      expect(mockDbService.class.delete).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(result).toEqual(mockClass);
    });

    it('should throw BadRequestException when class has students', async () => {
      mockDbService.class.findUnique.mockResolvedValue(mockClass);
      mockDbService.student.count.mockResolvedValue(5);

      await expect(service.remove('class-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when class not found', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getClassesByMedium', () => {
    it('should return classes filtered by medium', async () => {
      const mockClasses = [mockClass];
      mockDbService.class.findMany.mockResolvedValue(mockClasses);

      const result = await service.getClassesByMedium(Medium.BANGLA);

      expect(mockDbService.class.findMany).toHaveBeenCalledWith({
        where: {
          medium: Medium.BANGLA,
        },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              sections: true,
            },
          },
        },
      });
      expect(result).toEqual(mockClasses);
    });

    it('should return all classes when no medium filter provided', async () => {
      const mockClasses = [mockClass];
      mockDbService.class.findMany.mockResolvedValue(mockClasses);

      const result = await service.getClassesByMedium();

      expect(mockDbService.class.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              sections: true,
            },
          },
        },
      });
      expect(result).toEqual(mockClasses);
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

    it('should setup classes successfully', async () => {
      const mockClasses = [mockClass];
      mockDbService.class.findMany.mockResolvedValueOnce([
        { id: 'class-1' },
        { id: 'class-2' },
      ]);
      mockDbService.$transaction.mockResolvedValue([]);
      mockDbService.class.findMany.mockResolvedValueOnce(mockClasses);

      const result = await service.setupClasses(classSetupDto);

      expect(mockDbService.class.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['class-1', 'class-2'] } },
        select: { id: true, name: true },
      });
      expect(mockDbService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockClasses);
    });

    it('should throw BadRequestException for non-existent classes', async () => {
      mockDbService.class.findMany.mockResolvedValue([{ id: 'class-1' }]);

      await expect(service.setupClasses(classSetupDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('bulkUpdate', () => {
    const bulkUpdateDto: BulkUpdateClassDto = {
      classIds: ['class-1', 'class-2'],
      isActive: true,
    };

    it('should bulk update classes successfully', async () => {
      const mockClasses = [mockClass];
      mockDbService.class.findMany.mockResolvedValueOnce([
        { id: 'class-1' },
        { id: 'class-2' },
      ]);
      mockDbService.class.updateMany.mockResolvedValue({ count: 2 });
      mockDbService.class.findMany.mockResolvedValueOnce(mockClasses);

      const result = await service.bulkUpdate(bulkUpdateDto);

      expect(mockDbService.class.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['class-1', 'class-2'] } },
        data: { isActive: true },
      });
      expect(result).toEqual(mockClasses);
    });

    it('should throw BadRequestException for non-existent classes', async () => {
      mockDbService.class.findMany.mockResolvedValue([{ id: 'class-1' }]);

      await expect(service.bulkUpdate(bulkUpdateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetClasses', () => {
    it('should reset all classes to inactive', async () => {
      mockDbService.class.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.resetClasses();

      expect(mockDbService.class.updateMany).toHaveBeenCalledWith({
        data: { isActive: false },
      });
      expect(result).toEqual({
        message: 'All classes have been reset to inactive status',
      });
    });
  });
});
