/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { FilterExamDto } from './dto/filter-exam.dto';

@Injectable()
export class ExamsService {
  constructor(private prisma: DatabaseService) {}

  async create(createExamDto: CreateExamDto) {
    const { classId, sectionId, subjectId, teacherId, ...examData } =
      createExamDto;

    // Validate class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classExists) {
      throw new BadRequestException('Class not found');
    }

    // Validate section exists if provided
    if (sectionId) {
      const sectionExists = await this.prisma.section.findUnique({
        where: { id: sectionId },
      });
      if (!sectionExists) {
        throw new BadRequestException('Section not found');
      }
    }

    // Validate subject exists
    const subjectExists = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subjectExists) {
      throw new BadRequestException('Subject not found');
    }

    // Validate teacher exists
    const teacherExists = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacherExists) {
      throw new BadRequestException('Teacher not found');
    }

    // Validate pass marks is not greater than total marks
    if (examData.passMarks > examData.totalMarks) {
      throw new BadRequestException(
        'Pass marks cannot be greater than total marks',
      );
    }

    return this.prisma.exam.create({
      data: {
        ...examData,
        date: new Date(examData.date),
        classId,
        sectionId,
        subjectId,
        teacherId,
      },
      include: {
        class: true,
        section: true,
        subject: true,
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
    });
  }

  async findAll(filterDto?: FilterExamDto) {
    const where: any = {
      isActive: true,
    };

    if (filterDto?.classId) {
      where.classId = filterDto.classId;
    }

    if (filterDto?.sectionId) {
      where.sectionId = filterDto.sectionId;
    }

    if (filterDto?.subjectId) {
      where.subjectId = filterDto.subjectId;
    }

    if (filterDto?.type) {
      where.type = filterDto.type;
    }

    if (filterDto?.teacherId) {
      where.teacherId = filterDto.teacherId;
    }

    if (filterDto?.medium) {
      where.class = {
        medium: filterDto.medium,
      };
    }

    return this.prisma.exam.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            medium: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
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
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        class: true,
        section: true,
        subject: true,
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
        results: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rollNumber: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const { classId, sectionId, subjectId, teacherId, ...examData } =
      updateExamDto;

    // Validate class exists if provided
    if (classId) {
      const classExists = await this.prisma.class.findUnique({
        where: { id: classId },
      });
      if (!classExists) {
        throw new BadRequestException('Class not found');
      }
    }

    // Validate section exists if provided
    if (sectionId) {
      const sectionExists = await this.prisma.section.findUnique({
        where: { id: sectionId },
      });
      if (!sectionExists) {
        throw new BadRequestException('Section not found');
      }
    }

    // Validate subject exists if provided
    if (subjectId) {
      const subjectExists = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!subjectExists) {
        throw new BadRequestException('Subject not found');
      }
    }

    // Validate teacher exists if provided
    if (teacherId) {
      const teacherExists = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
      });
      if (!teacherExists) {
        throw new BadRequestException('Teacher not found');
      }
    }

    // Validate pass marks is not greater than total marks
    if (
      examData.passMarks &&
      examData.totalMarks &&
      examData.passMarks > examData.totalMarks
    ) {
      throw new BadRequestException(
        'Pass marks cannot be greater than total marks',
      );
    }

    const updateData: any = { ...examData };
    if (examData.date) {
      updateData.date = new Date(examData.date);
    }
    if (classId) updateData.classId = classId;
    if (sectionId) updateData.sectionId = sectionId;
    if (subjectId) updateData.subjectId = subjectId;
    if (teacherId) updateData.teacherId = teacherId;

    return this.prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        section: true,
        subject: true,
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
    });
  }

  async remove(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Soft delete by setting isActive to false
    return this.prisma.exam.update({
      where: { id },
      data: { isActive: false },
    });
  }



  async getExamList(classId?: string, medium?: string) {
    const where: any = {}; // Show all exams, not just inactive ones

    if (classId) {
      where.classId = classId;
    }

    if (medium) {
      where.class = {
        medium: medium as any,
      };
    }

    const exams = await this.prisma.exam.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            medium: true,
          },
        },
      },
      orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }],
    });

    if (exams.length === 0) {
      return [];
    }

    // Transform to the required format
    return exams.map((exam, index) => ({
      ExamID: exam.id, // Use actual database ID for PATCH operations
      ExamName: exam.title,
      CustomName: exam.customName || '',
      Sequence: exam.sequence,
      ClassID: exam.class.id, // Use actual class ID from database
      MediumID: exam.class.medium === 'BANGLA' ? 1 : 2, // 1 for BANGLA, 2 for ENGLISH
      IsActive: exam.isActive ? 1 : 0,
      StartDate: exam.startDate
        ? exam.startDate.toISOString()
        : exam.date.toISOString(),
      EndDate: exam.endDate
        ? exam.endDate.toISOString()
        : exam.date.toISOString(),
    }));
  }

  async updateExamListItem(examId: string, updateData: any) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const updateFields: any = {};

    if (updateData.CustomName !== undefined) {
      updateFields.customName = updateData.CustomName;
    }

    if (updateData.Sequence !== undefined) {
      updateFields.sequence = updateData.Sequence;
    }

    if (updateData.IsActive !== undefined) {
      updateFields.isActive = updateData.IsActive === 1;
    }

    if (updateData.StartDate !== undefined) {
      updateFields.startDate = new Date(updateData.StartDate);
    }

    if (updateData.EndDate !== undefined) {
      updateFields.endDate = new Date(updateData.EndDate);
    }

    return this.prisma.exam.update({
      where: { id: examId },
      data: updateFields,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            medium: true,
          },
        },
      },
    });
  }

  async saveExamSetup(setupData: any) {
    const { classId, medium, exams } = setupData;

    // Validate that exams array is provided
    if (!exams || !Array.isArray(exams)) {
      throw new BadRequestException('Exams array is required');
    }

    // Process each exam update
    const updatePromises = exams.map(async (examData: any) => {
      const { id, isActive, startDate, endDate, customName, sequence } = examData;

      if (!id) {
        throw new BadRequestException('Exam ID is required for each exam');
      }

      // Check if exam exists
      const existingExam = await this.prisma.exam.findUnique({
        where: { id },
      });

      if (!existingExam) {
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }

      // Prepare update data
      const updateFields: any = {};

      if (isActive !== undefined) {
        updateFields.isActive = isActive === 1;
      }

      if (startDate !== undefined) {
        updateFields.startDate = new Date(startDate);
      }

      if (endDate !== undefined) {
        updateFields.endDate = new Date(endDate);
      }

      if (customName !== undefined) {
        updateFields.customName = customName;
      }

      if (sequence !== undefined) {
        updateFields.sequence = sequence;
      }

      // Update the exam
      return this.prisma.exam.update({
        where: { id },
        data: updateFields,
      });
    });

    // Execute all updates
    await Promise.all(updatePromises);

    return {
      success: true,
      message: `Successfully updated ${exams.length} exam(s)`,
      updatedCount: exams.length,
    };
  }
}
