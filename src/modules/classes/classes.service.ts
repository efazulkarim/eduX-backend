import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';
import { CreateClassDto, Medium } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { BulkUpdateClassDto, ClassSetupDto } from './dto/bulk-update-class.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ClassesService {
  constructor(private db: DatabaseService) {}

  async create(createClassDto: CreateClassDto) {
    // Check for duplicate class name
    const existingClass = await this.db.class.findUnique({
      where: { name: createClassDto.name },
    });

    if (existingClass) {
      throw new BadRequestException(
        `Class with name ${createClassDto.name} already exists`,
      );
    }

    // No numeric grade handling required after schema update
    return this.db.class.create({
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
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [classes, total] = await Promise.all([
      this.db.class.findMany({
        skip,
        take: limit,
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
      }),
      this.db.class.count(),
    ]);

    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const classEntity = await this.db.class.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            department: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        subjects: true,
        _count: {
          select: {
            sections: true,
            subjects: true,
          },
        },
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classEntity;
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    await this.findOne(id);

    // Check for duplicate name if name is being updated
    if (updateClassDto.name) {
      const existingClass = await this.db.class.findFirst({
        where: {
          name: updateClassDto.name,
          id: { not: id },
        },
      });

      if (existingClass) {
        throw new BadRequestException(
          `Class with name ${updateClassDto.name} already exists`,
        );
      }
    }

    return this.db.class.update({
      where: { id },
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
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if class has any students
    const studentCount = await this.db.student.count({
      where: {
        section: {
          classId: id,
        },
      },
    });

    if (studentCount > 0) {
      throw new BadRequestException(
        `Cannot delete class with ${studentCount} students enrolled`,
      );
    }

    return this.db.class.delete({ where: { id } });
  }

  async getClassesByMedium(medium?: Medium) {
    const where: Prisma.ClassWhereInput = {};

    if (medium) {
      where.medium = medium;
    }

    return this.db.class.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            sections: true,
          },
        },
      },
    });
  }

  async setupClasses(classSetupDto: ClassSetupDto) {
    const { medium, classConfigs } = classSetupDto;

    // Validate all class IDs exist
    const classIds = classConfigs.map((config) => config.id);
    const existingClasses = await this.db.class.findMany({
      where: { id: { in: classIds } },
      select: { id: true, name: true },
    });

    if (existingClasses.length !== classIds.length) {
      const foundIds = existingClasses.map((c) => c.id);
      const missingIds = classIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Classes not found: ${missingIds.join(', ')}`,
      );
    }

    // Update classes in transaction
    const updatePromises = classConfigs.map((config) =>
      this.db.class.update({
        where: { id: config.id },
        data: { isActive: config.isActive },
      }),
    );

    await this.db.$transaction(updatePromises);

    // Return updated classes with medium filter if provided
    const where: Prisma.ClassWhereInput = { id: { in: classIds } };
    if (medium) {
      where.medium = medium as Medium;
    }

    return this.db.class.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            sections: true,
          },
        },
      },
    });
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateClassDto) {
    const { classIds, isActive } = bulkUpdateDto;

    // Validate all class IDs exist
    const existingClasses = await this.db.class.findMany({
      where: { id: { in: classIds } },
      select: { id: true },
    });

    if (existingClasses.length !== classIds.length) {
      const foundIds = existingClasses.map((c) => c.id);
      const missingIds = classIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Classes not found: ${missingIds.join(', ')}`,
      );
    }

    // Update all classes
    await this.db.class.updateMany({
      where: { id: { in: classIds } },
      data: { isActive },
    });

    return this.db.class.findMany({
      where: { id: { in: classIds } },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            sections: true,
          },
        },
      },
    });
  }

  async resetClasses() {
    // Set all classes to inactive
    await this.db.class.updateMany({
      data: { isActive: false },
    });

    return { message: 'All classes have been reset to inactive status' };
  }
}
