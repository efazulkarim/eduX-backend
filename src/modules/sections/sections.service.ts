/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import {
  BulkUpdateSectionDto,
  SectionSetupDto,
} from './dto/bulk-update-section.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SectionsService {
  constructor(private db: DatabaseService) {}

  async create(createSectionDto: CreateSectionDto) {
    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: createSectionDto.classId },
    });

    if (!classEntity) {
      throw new NotFoundException(
        `Class with ID ${createSectionDto.classId} not found`,
      );
    }

    // Validate department if provided
    if (createSectionDto.departmentId) {
      const department = await this.db.department.findUnique({
        where: { id: createSectionDto.departmentId },
      });

      if (!department) {
        throw new NotFoundException(
          `Department with ID ${createSectionDto.departmentId} not found`,
        );
      }
    }

    // Check for duplicate section
    const existingSection = await this.db.section.findFirst({
      where: {
        name: createSectionDto.name,
        classId: createSectionDto.classId,
        departmentId: createSectionDto.departmentId || null,
      },
    });

    if (existingSection) {
      throw new BadRequestException(
        `Section ${createSectionDto.name} already exists for this class${
          createSectionDto.departmentId ? ' and department' : ''
        }`,
      );
    }



    return this.db.section.create({
      data: createSectionDto,
      include: {
        class: true,
        department: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [sections, total] = await Promise.all([
      this.db.section.findMany({
        skip,
        take: limit,
        include: {
          class: true,
          department: true,
          _count: {
            select: {
              students: true,
            },
          },
        },
        orderBy: [
          { class: { name: 'asc' } },
          { department: { name: 'asc' } },
          { name: 'asc' },
        ],
      }),
      this.db.section.count(),
    ]);

    return {
      sections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findByClass(
    classId: string,
    departmentId?: string,
    paginationDto?: PaginationDto,
  ) {
    const { page = 1, limit = 50 } = paginationDto || {};
    const skip = (page - 1) * limit;

    const where: any = { classId };
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const [sections, total] = await Promise.all([
      this.db.section.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: true,
          department: true,
          _count: {
            select: {
              students: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.db.section.count({ where }),
    ]);

    return {
      sections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const section = await this.db.section.findUnique({
      where: { id },
      include: {
        class: true,
        department: true,
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
        subjects: true,
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const existingSection = await this.findOne(id);

    // Validate class if being updated
    if (updateSectionDto.classId) {
      const classEntity = await this.db.class.findUnique({
        where: { id: updateSectionDto.classId },
      });

      if (!classEntity) {
        throw new NotFoundException(
          `Class with ID ${updateSectionDto.classId} not found`,
        );
      }

      // No grade-based department compatibility needed anymore
    }

    // Validate department if being updated
    if (updateSectionDto.departmentId) {
      const department = await this.db.department.findUnique({
        where: { id: updateSectionDto.departmentId },
      });

      if (!department) {
        throw new NotFoundException(
          `Department with ID ${updateSectionDto.departmentId} not found`,
        );
      }
    }

    // Check for duplicate section name
    if (
      updateSectionDto.name ||
      updateSectionDto.classId ||
      updateSectionDto.departmentId !== undefined
    ) {
      const duplicateSection = await this.db.section.findFirst({
        where: {
          name: updateSectionDto.name || existingSection.name,
          classId: updateSectionDto.classId || existingSection.classId,
          departmentId:
            updateSectionDto.departmentId !== undefined
              ? updateSectionDto.departmentId
              : existingSection.departmentId,
          id: { not: id },
        },
      });

      if (duplicateSection) {
        throw new BadRequestException(
          `Section ${updateSectionDto.name || existingSection.name} already exists for this class and department combination`,
        );
      }
    }

    return this.db.section.update({
      where: { id },
      data: updateSectionDto,
      include: {
        class: true,
        department: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if section has any students
    const studentCount = await this.db.student.count({
      where: { sectionId: id },
    });

    if (studentCount > 0) {
      throw new BadRequestException(
        `Cannot delete section with ${studentCount} students enrolled`,
      );
    }

    return this.db.section.delete({ where: { id } });
  }

  async setupSections(sectionSetupDto: SectionSetupDto) {
    const { classId, departmentId, sectionConfigs } = sectionSetupDto;

    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Validate department if provided
    if (departmentId) {
      const department = await this.db.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw new NotFoundException(
          `Department with ID ${departmentId} not found`,
        );
      }
    }

    // Process section configurations
    const operations: any[] = [];

    for (const config of sectionConfigs) {
      if (config.id) {
        // Update existing section
        operations.push(
          this.db.section.update({
            where: { id: config.id },
            data: {
              isActive: config.isActive,
            },
          }),
        );
      } else {
        // Create new section
        operations.push(
          this.db.section.create({
            data: {
              name: config.name,
              classId,
              departmentId: departmentId || null,
              isActive: config.isActive,
            },
          }),
        );
      }
    }

    // Execute all operations in transaction
    await this.db.$transaction(operations);

    // Return updated sections
    return this.db.section.findMany({
      where: {
        classId,
        departmentId: departmentId || null,
      },
      include: {
        class: true,
        department: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateSectionDto) {
    const { sectionIds, isActive } = bulkUpdateDto;

    // Validate all section IDs exist
    const existingSections = await this.db.section.findMany({
      where: { id: { in: sectionIds } },
      select: { id: true },
    });

    if (existingSections.length !== sectionIds.length) {
      const foundIds = existingSections.map((s) => s.id);
      const missingIds = sectionIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Sections not found: ${missingIds.join(', ')}`,
      );
    }

    // Update all sections
    await this.db.section.updateMany({
      where: { id: { in: sectionIds } },
      data: { isActive },
    });

    return this.db.section.findMany({
      where: { id: { in: sectionIds } },
      include: {
        class: true,
        department: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async resetSections(classId: string, departmentId?: string) {
    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Build where clause
    const where: any = { classId };
    if (departmentId) {
      where.departmentId = departmentId;
    }

    // Set all matching sections to inactive
    await this.db.section.updateMany({
      where,
      data: { isActive: false },
    });

    return { message: 'Sections have been reset to inactive status' };
  }
}
