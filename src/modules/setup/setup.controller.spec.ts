import { Test, TestingModule } from '@nestjs/testing';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { Medium } from '../classes/dto/create-class.dto';
import { SaveDepartmentSetupDto } from './dto/department-setup.dto';

describe('SetupController', () => {
  let controller: SetupController;
  let service: SetupService;

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

  const mockSetupService = {
    getClassesForSetup: jest.fn(),
    saveClassSetup: jest.fn(),
    resetClassSetup: jest.fn(),
    getDepartmentsForSetup: jest.fn(),
    saveDepartmentSetup: jest.fn(),
    resetDepartmentSetup: jest.fn(),
    getSectionsForSetup: jest.fn(),
    saveSectionSetup: jest.fn(),
    resetSectionSetup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SetupController],
      providers: [
        {
          provide: SetupService,
          useValue: mockSetupService,
        },
      ],
    }).compile();

    controller = module.get<SetupController>(SetupController);
    service = module.get<SetupService>(SetupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getClassesForSetup', () => {
    it('should return classes for setup', async () => {
      const mockClasses = [mockClass];
      mockSetupService.getClassesForSetup.mockResolvedValue(mockClasses);

      const result = await controller.getClassesForSetup(Medium.BANGLA);

      expect(service.getClassesForSetup).toHaveBeenCalledWith(Medium.BANGLA);
      expect(result).toEqual(mockClasses);
    });

    it('should return all classes when no medium specified', async () => {
      const mockClasses = [mockClass];
      mockSetupService.getClassesForSetup.mockResolvedValue(mockClasses);

      const result = await controller.getClassesForSetup();

      expect(service.getClassesForSetup).toHaveBeenCalledWith(undefined);
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

    it('should save class setup', async () => {
      const mockResponse = {
        message: 'Class setup saved successfully',
        updatedClasses: 2,
      };
      mockSetupService.saveClassSetup.mockResolvedValue(mockResponse);

      const result = await controller.saveClassSetup(setupData);

      expect(service.saveClassSetup).toHaveBeenCalledWith(setupData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetClassSetup', () => {
    it('should reset class setup', async () => {
      const mockResponse = { message: 'Class setup reset successfully' };
      mockSetupService.resetClassSetup.mockResolvedValue(mockResponse);

      const result = await controller.resetClassSetup(Medium.BANGLA);

      expect(service.resetClassSetup).toHaveBeenCalledWith(Medium.BANGLA);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDepartmentsForSetup', () => {
    it('should return departments for setup', async () => {
      const mockResponse = {
        class: { id: 'class-1', name: 'One' },
        departments: [mockDepartment],
      };
      mockSetupService.getDepartmentsForSetup.mockResolvedValue(mockResponse);

      const result = await controller.getDepartmentsForSetup('class-1');

      expect(service.getDepartmentsForSetup).toHaveBeenCalledWith('class-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('saveDepartmentSetup', () => {
    const setupData: SaveDepartmentSetupDto = {
      classId: 'class-1',
      departments: [
        { id: 'dept-1', isActive: true },
        { id: 'dept-2', isActive: false },
      ],
    };

    it('should save department setup', async () => {
      const mockResponse = {
        message: 'Department setup saved successfully',
        updatedDepartments: 2,
      };
      mockSetupService.saveDepartmentSetup.mockResolvedValue(mockResponse);

      const result = await controller.saveDepartmentSetup(setupData);

      expect(service.saveDepartmentSetup).toHaveBeenCalledWith(setupData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetDepartmentSetup', () => {
    it('should reset department setup', async () => {
      const mockResponse = { message: 'Department setup reset successfully' };
      mockSetupService.resetDepartmentSetup.mockResolvedValue(mockResponse);

      const result = await controller.resetDepartmentSetup('class-1');

      expect(service.resetDepartmentSetup).toHaveBeenCalledWith('class-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSectionsForSetup', () => {
    it('should return sections for setup', async () => {
      const mockResponse = {
        class: { id: 'class-1', name: 'One' },
        department: { id: 'dept-1', name: 'Science' },
        sections: [mockSection],
        availableTeachers: [],
      };
      mockSetupService.getSectionsForSetup.mockResolvedValue(mockResponse);

      const result = await controller.getSectionsForSetup('class-1', 'dept-1');

      expect(service.getSectionsForSetup).toHaveBeenCalledWith(
        'class-1',
        'dept-1',
      );
      expect(result).toEqual(mockResponse);
    });

    it('should work without department', async () => {
      const mockResponse = {
        class: { id: 'class-1', name: 'One' },
        department: null,
        sections: [mockSection],
        availableTeachers: [],
      };
      mockSetupService.getSectionsForSetup.mockResolvedValue(mockResponse);

      const result = await controller.getSectionsForSetup('class-1');

      expect(service.getSectionsForSetup).toHaveBeenCalledWith(
        'class-1',
        undefined,
      );
      expect(result).toEqual(mockResponse);
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

    it('should save section setup', async () => {
      const mockResponse = {
        message: 'Section setup saved successfully',
        processedSections: 2,
      };
      mockSetupService.saveSectionSetup.mockResolvedValue(mockResponse);

      const result = await controller.saveSectionSetup(setupData);

      expect(service.saveSectionSetup).toHaveBeenCalledWith(setupData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetSectionSetup', () => {
    const resetData = {
      classId: 'class-1',
      departmentId: 'dept-1',
    };

    it('should reset section setup', async () => {
      const mockResponse = { message: 'Section setup reset successfully' };
      mockSetupService.resetSectionSetup.mockResolvedValue(mockResponse);

      const result = await controller.resetSectionSetup(resetData);

      expect(service.resetSectionSetup).toHaveBeenCalledWith(resetData);
      expect(result).toEqual(mockResponse);
    });
  });
});
