import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { DatabaseService } from '../../database/database.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Gender } from '../../common/constants/status.constant';

describe('StudentsService', () => {
  let service: StudentsService;
  let mockDbService: {
    student: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  const mockStudent = {
    id: '1',
    rollNumber: 'S001',
    admissionNo: 'ADM001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('2010-01-01'),
    gender: Gender.MALE,
    address: '123 Main St',
    parentName: 'John Doe Sr',
    parentPhone: '+1234567890',
    parentEmail: 'parent@example.com',
    bloodGroup: 'O+',
    admissionDate: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sectionId: 'section-1',
    section: {
      id: 'section-1',
      name: 'A',
      class: {
        id: 'class-1',
        name: 'One',
      },
    },
  };

  beforeEach(async () => {
    mockDbService = {
      student: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  describe('create', () => {
    const createStudentDto: CreateStudentDto = {
      rollNumber: 'S001',
      admissionNo: 'ADM001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2010-01-01',
      gender: Gender.MALE,
      address: '123 Main St',
      parentName: 'John Doe Sr',
      parentPhone: '+1234567890',
      parentEmail: 'parent@example.com',
      bloodGroup: 'O+',
    };

    it('should create a student successfully', async () => {
      mockDbService.student.findUnique.mockResolvedValue(null);
      mockDbService.student.create.mockResolvedValue(mockStudent);

      const result = await service.create(createStudentDto);

      expect(mockDbService.student.findUnique).toHaveBeenCalledTimes(2);
      expect(mockDbService.student.create).toHaveBeenCalledWith({
        data: createStudentDto,
        include: {
          section: {
            include: {
              class: true,
            },
          },
        },
      });
      expect(result).toEqual(mockStudent);
    });

    it('should throw BadRequestException for duplicate roll number', async () => {
      mockDbService.student.findUnique
        .mockResolvedValueOnce(mockStudent)
        .mockResolvedValueOnce(null);

      await expect(service.create(createStudentDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDbService.student.findUnique).toHaveBeenCalledWith({
        where: { rollNumber: createStudentDto.rollNumber },
      });
    });

    it('should throw BadRequestException for duplicate admission number', async () => {
      mockDbService.student.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockStudent);

      await expect(service.create(createStudentDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDbService.student.findUnique).toHaveBeenCalledWith({
        where: { admissionNo: createStudentDto.admissionNo },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated students', async () => {
      const mockStudents = [mockStudent];
      const mockTotal = 1;

      mockDbService.student.findMany.mockResolvedValue(mockStudents);
      mockDbService.student.count.mockResolvedValue(mockTotal);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        students: mockStudents,
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          pages: 1,
        },
      });
    });

    it('should use default pagination values', async () => {
      mockDbService.student.findMany.mockResolvedValue([]);
      mockDbService.student.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockDbService.student.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          section: {
            include: {
              class: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a student by id', async () => {
      mockDbService.student.findUnique.mockResolvedValue(mockStudent);

      const result = await service.findOne('1');

      expect(mockDbService.student.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          section: {
            include: {
              class: true,
            },
          },
          attendances: { take: 10, orderBy: { date: 'desc' } },
          examResults: {
            take: 10,
            include: { exam: true },
            orderBy: { createdAt: 'desc' },
          },
          feeInvoices: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      });
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockDbService.student.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateStudentDto: UpdateStudentDto = {
      firstName: 'Jane',
    };

    it('should update a student successfully', async () => {
      const updatedStudent = { ...mockStudent, ...updateStudentDto };

      mockDbService.student.findUnique.mockResolvedValue(mockStudent);
      mockDbService.student.update.mockResolvedValue(updatedStudent);

      const result = await service.update('1', updateStudentDto);

      expect(mockDbService.student.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateStudentDto,
        include: {
          section: {
            include: {
              class: true,
            },
          },
        },
      });
      expect(result.firstName).toBe('Jane');
    });

    it('should throw NotFoundException when student not found', async () => {
      mockDbService.student.findUnique.mockResolvedValue(null);

      await expect(service.update('999', updateStudentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a student successfully', async () => {
      mockDbService.student.findUnique.mockResolvedValue(mockStudent);
      mockDbService.student.delete.mockResolvedValue(mockStudent);

      const result = await service.remove('1');

      expect(mockDbService.student.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockDbService.student.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
