/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SetupService } from './setup.service';
import { DatabaseService } from '../../database/database.service';
import { Medium } from '../classes/dto/create-class.dto';

describe('SetupService', () => {
  let service: SetupService;
  let mockDbService: {
    class: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    department: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    section: {
      findMany: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
    };
    teacher: {
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockClass = {
    id: 'class-1',
    name: 'One',
    medium: Medium.BANGLA,
    isActive: true,
    _count: {
      sections: 2,
    },
  };

  const mockDepartment = {
    id: 'dept-1',
    name: 'Science',
    description: 'Science department',
    isActive: true,
    _count: {
      sections: 1,
      subjects: 3,
    },
  };

  const mockSection = {
    id: 'section-1',
    name: 'A',
    classId: 'class-1',
    departmentId: 'dept-1',
    teacherId: 'teacher-1',
    isActive: true,
    teacher: {
      id: 'teacher-1',
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    },
    _count: {
      students: 25,
    },
  };

  const mockTeacher = {
    id: 'teacher-1',
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  };

  beforeEach(async () => {
    mockDbService = {
      class: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      department: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      section: {
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      teacher: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetupService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<SetupService>(SetupService);
  });

  describe('getClassesForSetup', () => {
    it('should return classes filtered by medium', async () => {
      const mockClasses = [mockClass];
      mockDbService.class.findMany.mockResolvedValue(mockClasses);

      const result = await service.getClassesForSetup(Medium.BANGLA);

      expect(mockDbService.class.findMany).toHaveBeenCalledWith({
        where: { medium: Medium.BANGLA },
        select: {
          id: true,
          name: true,
          medium: true,
          isActive: true,
          _count: {
            select: {
              sections: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockClasses);
    });

    it('should return all classes when no medium specified', async () => {
      const mockClasses = [mockClass];
      mockDbService.class.findMany.mockResolvedValue(mockClasses);

      const result = await service.getClassesForSetup();

      expect(mockDbService.class.findMany).toHaveBeenCalledWith({
        where: {},
        select: {
          id: true,
          name: true,
          medium: true,
          isActive: true,
          _count: {
            select: {
              sections: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockClasses);
    });
  });

  describe('saveClassSetup', () => {
    const setupData = {
      medium: 'BANGLA',
      classes: [
        { id: 'class-1', isActive: true },
        { id: 'class-2', isActive: false },
      ],
    };

    it('should save class setup successfully', async () => {
      mockDbService.class.findMany.mockResolvedValue([
        { id: 'class-1' },
        { id: 'class-2' },
      ]);
      mockDbService.$transaction.mockResolvedValue([]);

      const result = await service.saveClassSetup(setupData);

      expect(mockDbService.class.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['class-1', 'class-2'] } },
        select: { id: true },
      });
      expect(mockDbService.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Class setup saved successfully',
        updatedClasses: 2,
      });
    });

    it('should throw BadRequestException for non-existent classes', async () => {
      mockDbService.class.findMany.mockResolvedValue([{ id: 'class-1' }]);

      await expect(service.saveClassSetup(setupData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetClassSetup', () => {
    it('should reset classes by medium', async () => {
      mockDbService.class.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.resetClassSetup(Medium.BANGLA);

      expect(mockDbService.class.updateMany).toHaveBeenCalledWith({
        where: { medium: Medium.BANGLA },
        data: { isActive: false },
      });
      expect(result).toEqual({ message: 'Class setup reset successfully' });
    });

    it('should reset all classes when no medium specified', async () => {
      mockDbService.class.updateMany.mockResolvedValue({ count: 10 });

      const result = await service.resetClassSetup();

      expect(mockDbService.class.updateMany).toHaveBeenCalledWith({
        where: {},
        data: { isActive: false },
      });
      expect(result).toEqual({ message: 'Class setup reset successfully' });
    });
  });

  describe('getDepartmentsForSetup', () => {
    it('should return departments for a class', async () => {
      const mockClassEntity = { id: 'class-1', name: 'One' };
      const mockDepartments = [mockDepartment];

      mockDbService.class.findUnique.mockResolvedValue(mockClassEntity);
      mockDbService.department.findMany.mockResolvedValue(mockDepartments);

      const result = await service.getDepartmentsForSetup('class-1');

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
        select: { id: true, name: true },
      });
      expect(mockDbService.department.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          _count: {
            select: {
              sections: {
                where: { classId: 'class-1' },
              },
              subjects: {
                where: { classId: 'class-1' },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual({
        class: mockClassEntity,
        departments: mockDepartments,
      });
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(
        service.getDepartmentsForSetup('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveDepartmentSetup', () => {
    const setupData = {
      classId: 'class-1',
      departments: [
        { id: 'dept-1', isActive: true },
        { id: 'dept-2', isActive: false },
      ],
    };

    it('should save department setup successfully', async () => {
      mockDbService.class.findUnique.mockResolvedValue({ id: 'class-1' });
      mockDbService.department.findMany.mockResolvedValue([
        { id: 'dept-1' },
        { id: 'dept-2' },
      ]);
      mockDbService.$transaction.mockResolvedValue([]);

      const result = await service.saveDepartmentSetup(setupData);

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.department.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['dept-1', 'dept-2'] } },
        select: { id: true },
      });
      expect(mockDbService.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Department setup saved successfully',
        updatedDepartments: 2,
      });
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.saveDepartmentSetup(setupData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for non-existent departments', async () => {
      mockDbService.class.findUnique.mockResolvedValue({ id: 'class-1' });
      mockDbService.department.findMany.mockResolvedValue([{ id: 'dept-1' }]);

      await expect(service.saveDepartmentSetup(setupData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetDepartmentSetup', () => {
    it('should reset departments for a class', async () => {
      mockDbService.class.findUnique.mockResolvedValue({ id: 'class-1' });
      mockDbService.department.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.resetDepartmentSetup('class-1');

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.department.updateMany).toHaveBeenCalledWith({
        data: { isActive: false },
      });
      expect(result).toEqual({
        message: 'Department setup reset successfully',
      });
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(
        service.resetDepartmentSetup('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSectionsForSetup', () => {
    it('should return sections for class and department', async () => {
      const mockClassEntity = { id: 'class-1', name: 'One' };
      const mockDepartmentEntity = { id: 'dept-1', name: 'Science' };
      const mockSections = [mockSection];
      const mockTeachers = [mockTeacher];

      mockDbService.class.findUnique.mockResolvedValue(mockClassEntity);
      mockDbService.department.findUnique.mockResolvedValue(
        mockDepartmentEntity,
      );
      mockDbService.section.findMany.mockResolvedValue(mockSections);
      mockDbService.teacher.findMany.mockResolvedValue(mockTeachers);

      const result = await service.getSectionsForSetup('class-1', 'dept-1');

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
        select: { id: true, name: true },
      });
      expect(mockDbService.department.findUnique).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
        select: { id: true, name: true },
      });
      expect(result).toEqual({
        class: mockClassEntity,
        department: mockDepartmentEntity,
        sections: mockSections,
        availableTeachers: mockTeachers,
      });
    });

    it('should work without department', async () => {
      const mockClassEntity = { id: 'class-1', name: 'One' };
      const mockSections = [mockSection];
      const mockTeachers = [mockTeacher];

      mockDbService.class.findUnique.mockResolvedValue(mockClassEntity);
      mockDbService.section.findMany.mockResolvedValue(mockSections);
      mockDbService.teacher.findMany.mockResolvedValue(mockTeachers);

      const result = await service.getSectionsForSetup('class-1');

      expect(result).toEqual({
        class: mockClassEntity,
        department: null,
        sections: mockSections,
        availableTeachers: mockTeachers,
      });
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.getSectionsForSetup('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-existent department', async () => {
      mockDbService.class.findUnique.mockResolvedValue({ id: 'class-1' });
      mockDbService.department.findUnique.mockResolvedValue(null);

      await expect(
        service.getSectionsForSetup('class-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveSectionSetup', () => {
    const setupData = {
      classId: 'class-1',
      departmentId: 'dept-1',
      sections: [
        { id: 'section-1', name: 'A', isActive: true, teacherId: 'teacher-1' },
        { name: 'B', isActive: true, teacherId: undefined },
      ],
    };

    it('should save section setup successfully', async () => {
      mockDbService.class.findUnique.mockResolvedValue({ id: 'class-1' });
      mockDbService.department.findUnique.mockResolvedValue({ id: 'dept-1' });
      mockDbService.$transaction.mockResolvedValue([]);

      const result = await service.saveSectionSetup(setupData);

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.department.findUnique).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
      });
      expect(mockDbService.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Section setup saved successfully',
        processedSections: 2,
      });
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.saveSectionSetup(setupData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-existent department', async () => {
      mockDbService.class.findUnique.mockResolvedValue({ id: 'class-1' });
      mockDbService.department.findUnique.mockResolvedValue(null);

      await expect(service.saveSectionSetup(setupData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetSectionSetup', () => {
    const resetData = {
      classId: 'class-1',
      departmentId: 'dept-1',
    };

    it('should reset sections successfully', async () => {
      mockDbService.class.findUnique.mockResolvedValue({ id: 'class-1' });
      mockDbService.section.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.resetSectionSetup(resetData);

      expect(mockDbService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
      });
      expect(mockDbService.section.updateMany).toHaveBeenCalledWith({
        where: { classId: 'class-1', departmentId: 'dept-1' },
        data: { isActive: false },
      });
      expect(result).toEqual({ message: 'Section setup reset successfully' });
    });

    it('should throw NotFoundException for non-existent class', async () => {
      mockDbService.class.findUnique.mockResolvedValue(null);

      await expect(service.resetSectionSetup(resetData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
