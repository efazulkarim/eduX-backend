import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FilterStudentDto } from './dto/filter-student.dto';

@Injectable()
export class StudentsService {
  constructor(private db: DatabaseService) {}

  async create(createStudentDto: CreateStudentDto) {
    // Check for duplicate roll number if provided
    if (createStudentDto.rollNumber) {
      const existingByRoll = await this.db.student.findUnique({
        where: { rollNumber: createStudentDto.rollNumber },
      });
      if (existingByRoll) {
        throw new BadRequestException(
          `Student with roll number ${createStudentDto.rollNumber} already exists`,
        );
      }
    }
    
    // Check for duplicate admission number if provided
    if (createStudentDto.admissionNo) {
      const existingByAdmission = await this.db.student.findUnique({
        where: { admissionNo: createStudentDto.admissionNo },
      });
      if (existingByAdmission) {
        throw new BadRequestException(
          `Student with admission number ${createStudentDto.admissionNo} already exists`,
        );
      }
    }

    // Convert dateOfBirth string to Date object if provided
    const data = {
      ...createStudentDto,
      ...(createStudentDto.dateOfBirth && {
        dateOfBirth: new Date(createStudentDto.dateOfBirth),
      }),
    };

    return this.db.student.create({
      data,
      include: {
        section: {
          include: {
            class: true,
            department: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: FilterStudentDto) {
    const { page = 1, limit = 10, medium, academicYear, gender, classId, sectionId, search, isActive, shift } = filterDto;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    if (medium) {
      where.medium = medium;
    }

    if (academicYear) {
      where.academicYear = academicYear;
    }

    if (gender) {
      where.gender = gender;
    }

    if (sectionId) {
      where.sectionId = sectionId;
    }

    if (classId) {
      where.section = {
        classId: classId,
      };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { admissionNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (shift) {
      where.shift = shift;
    }

    const [students, total] = await Promise.all([
      this.db.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          section: {
            include: {
              class: true,
              department: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.db.student.count({ where }),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        medium,
        academicYear,
        gender,
        classId,
        sectionId,
        search,
        isActive,
        shift,
      },
    };
  }

  async findOne(id: string) {
    const student = await this.db.student.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            class: true,
            department: true,
          },
        },
        attendances: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        examResults: {
          take: 10,
          include: { exam: true },
          orderBy: { createdAt: 'desc' },
        },
        feeInvoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);
    
    // Convert dateOfBirth string to Date object if provided
    const data = {
      ...updateStudentDto,
      ...(updateStudentDto.dateOfBirth && {
        dateOfBirth: new Date(updateStudentDto.dateOfBirth),
      }),
    };
    
    return this.db.student.update({
      where: { id },
      data,
      include: {
        section: {
          include: {
            class: true,
            department: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.db.student.delete({ where: { id } });
  }
}
