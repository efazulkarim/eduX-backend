import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Medium } from '../classes/dto/create-class.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SetupService {
  constructor(private db: DatabaseService) {}

  async getClassesForSetup(medium?: Medium) {
    const where: Prisma.ClassWhereInput = {};

    if (medium) {
      where.medium = medium;
    }

    return this.db.class.findMany({
      where,
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
  }

  async saveClassSetup(setupData: {
    medium?: string;
    classes: Array<{ id: string; isActive: boolean }>;
  }) {
    const { classes } = setupData;

    // Validate all class IDs exist
    const classIds = classes.map((c) => c.id);
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

    // Update classes in transaction
    const updatePromises = classes.map((classConfig) =>
      this.db.class.update({
        where: { id: classConfig.id },
        data: { isActive: classConfig.isActive },
      }),
    );

    await this.db.$transaction(updatePromises);

    return {
      message: 'Class setup saved successfully',
      updatedClasses: classes.length,
    };
  }

  async resetClassSetup(medium?: Medium) {
    const where: Prisma.ClassWhereInput = {};

    if (medium) {
      where.medium = medium;
    }

    await this.db.class.updateMany({
      where,
      data: { isActive: false },
    });

    return { message: 'Class setup reset successfully' };
  }

  async getDepartmentsForSetup(classId: string) {
    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Get all departments with their class-specific status
    const departments = await this.db.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        classDepartments: {
          where: { classId },
          select: {
            id: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            sections: {
              where: { classId },
            },
            subjects: {
              where: { classId },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform to include class-specific active status
    const departmentsWithClassStatus = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      isActive: dept.classDepartments[0]?.isActive || false,
      _count: dept._count,
    }));

    return {
      class: classEntity,
      departments: departmentsWithClassStatus,
    };
  }

  async saveDepartmentSetup(setupData: {
    classId: string;
    departments: Array<{ id: string; isActive: boolean }>;
  }) {
    const { classId, departments } = setupData;

    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Validate all department IDs exist
    const departmentIds = departments.map((d) => d.id);
    const existingDepartments = await this.db.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true },
    });

    if (existingDepartments.length !== departmentIds.length) {
      const foundIds = existingDepartments.map((d) => d.id);
      const missingIds = departmentIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Departments not found: ${missingIds.join(', ')}`,
      );
    }

    // Update class-department relationships in transaction
    const updatePromises = departments.map((deptConfig) =>
      this.db.classDepartment.upsert({
        where: {
          classId_departmentId: {
            classId,
            departmentId: deptConfig.id,
          },
        },
        update: {
          isActive: deptConfig.isActive,
        },
        create: {
          classId,
          departmentId: deptConfig.id,
          isActive: deptConfig.isActive,
        },
      }),
    );

    await this.db.$transaction(updatePromises);

    return {
      message: 'Department setup saved successfully',
      updatedDepartments: departments.length,
    };
  }

  async resetDepartmentSetup(classId: string) {
    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Reset all class-department relationships to inactive
    await this.db.classDepartment.updateMany({
      where: { classId },
      data: { isActive: false },
    });

    return { message: 'Department setup reset successfully' };
  }

  async getSectionsForSetup(classId: string, departmentId?: string) {
    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Validate department if provided
    let department: { id: string; name: string } | null = null;
    if (departmentId) {
      department = await this.db.department.findUnique({
        where: { id: departmentId },
        select: { id: true, name: true },
      });

      if (!department) {
        throw new NotFoundException(
          `Department with ID ${departmentId} not found`,
        );
      }
    }

    // Get existing sections
    const sections = await this.db.section.findMany({
      where: {
        classId,
        departmentId: departmentId || null,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Get available teachers
    const availableTeachers = await this.db.staff.findMany({
      where: { isActive: true, role: 'TEACHER' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    return {
      class: classEntity,
      department,
      sections,
      availableTeachers,
    };
  }

  async saveSectionSetup(setupData: {
    classId: string;
    departmentId?: string;
    sections: Array<{
      id?: string;
      name: string;
      isActive: boolean;
      teacherId?: string;
    }>;
  }) {
    const { classId, departmentId, sections } = setupData;

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

    for (const sectionConfig of sections) {
      if (sectionConfig.id) {
        // Update existing section
        operations.push(
          this.db.section.update({
            where: { id: sectionConfig.id },
            data: {
              isActive: sectionConfig.isActive,
            },
          }),
        );
      } else {
        // Create new section
        operations.push(
          this.db.section.create({
            data: {
              name: sectionConfig.name,
              classId,
              departmentId: departmentId || null,
              isActive: sectionConfig.isActive,
            },
          }),
        );
      }
    }

    // Execute all operations in transaction
    await this.db.$transaction(operations);

    return {
      message: 'Section setup saved successfully',
      processedSections: sections.length,
    };
  }

  async resetSectionSetup(resetData: {
    classId: string;
    departmentId?: string;
  }) {
    const { classId, departmentId } = resetData;

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

    return { message: 'Section setup reset successfully' };
  }
}
