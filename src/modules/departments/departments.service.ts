import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  BulkUpdateDepartmentDto,
  DepartmentSetupDto,
} from './dto/bulk-update-department.dto';
import { ClassDepartmentSetupDto } from './dto/class-department.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(private db: DatabaseService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // Check for duplicate department name
    const existingDepartment = await this.db.department.findFirst({
      where: { name: createDepartmentDto.name },
    });

    if (existingDepartment) {
      throw new BadRequestException(
        `Department with name ${createDepartmentDto.name} already exists`,
      );
    }

    return this.db.department.create({
      data: createDepartmentDto,
      include: {
        sections: true,
        _count: {
          select: {
            sections: true,
            subjects: true,
          },
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      this.db.department.findMany({
        skip,
        take: limit,
        include: {
          sections: {
            include: {
              class: true,
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
              subjects: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.db.department.count(),
    ]);

    return {
      departments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const department = await this.db.department.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            class: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        subjects: {
          include: {
            class: true,
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

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async findByClass(classId: string) {
    // Ensure class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Get departments that are active for this specific class
    const classDepartments = await this.db.classDepartment.findMany({
      where: {
        classId,
        isActive: true,
      },
      include: {
        department: {
          include: {
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
        },
      },
      orderBy: {
        department: {
          name: 'asc',
        },
      },
    });

    return classDepartments.map(cd => cd.department);
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id);

    // Check for duplicate name if name is being updated
    if (updateDepartmentDto.name) {
      const existingDepartment = await this.db.department.findFirst({
        where: {
          name: updateDepartmentDto.name,
          id: { not: id },
        },
      });

      if (existingDepartment) {
        throw new BadRequestException(
          `Department with name ${updateDepartmentDto.name} already exists`,
        );
      }
    }

    return this.db.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        sections: true,
        _count: {
          select: {
            sections: true,
            subjects: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if department has any sections with students
    const sectionCount = await this.db.section.count({
      where: {
        departmentId: id,
        students: {
          some: {},
        },
      },
    });

    if (sectionCount > 0) {
      throw new BadRequestException(
        `Cannot delete department with sections containing students`,
      );
    }

    return this.db.department.delete({ where: { id } });
  }

  async setupDepartments(departmentSetupDto: DepartmentSetupDto) {
    const { classId, departmentConfigs } = departmentSetupDto;

    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Validate all department IDs exist
    const departmentIds = departmentConfigs.map((config) => config.id);
    const existingDepartments = await this.db.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true },
    });

    if (existingDepartments.length !== departmentIds.length) {
      const foundIds = existingDepartments.map((d) => d.id);
      const missingIds = departmentIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Departments not found: ${missingIds.join(', ')}`,
      );
    }

    // Update departments in transaction
    const updatePromises = departmentConfigs.map((config) =>
      this.db.department.update({
        where: { id: config.id },
        data: { isActive: config.isActive },
      }),
    );

    await this.db.$transaction(updatePromises);

    // Return updated departments
    return this.db.department.findMany({
      where: { id: { in: departmentIds } },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            sections: true,
            subjects: true,
          },
        },
      },
    });
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateDepartmentDto) {
    const { departmentIds, isActive } = bulkUpdateDto;

    // Validate all department IDs exist
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

    // Update all departments
    await this.db.department.updateMany({
      where: { id: { in: departmentIds } },
      data: { isActive },
    });

    return this.db.department.findMany({
      where: { id: { in: departmentIds } },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            sections: true,
            subjects: true,
          },
        },
      },
    });
  }

  async resetDepartments(classId: string) {
    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Set all departments to inactive
    await this.db.department.updateMany({
      data: { isActive: false },
    });

    return { message: 'All departments have been reset to inactive status' };
  }

  // New methods for class-department relationships
  async setupClassDepartments(setupDto: ClassDepartmentSetupDto) {
    const { classId, departments } = setupDto;

    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Validate all department IDs exist
    const departmentIds = departments.map(d => d.departmentId);
    const existingDepartments = await this.db.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true },
    });

    if (existingDepartments.length !== departmentIds.length) {
      const foundIds = existingDepartments.map(d => d.id);
      const missingIds = departmentIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(
        `Departments not found: ${missingIds.join(', ')}`,
      );
    }

    // Use transaction to update class-department relationships
    const operations = departments.map(deptConfig => {
      return this.db.classDepartment.upsert({
        where: {
          classId_departmentId: {
            classId,
            departmentId: deptConfig.departmentId,
          },
        },
        update: {
          isActive: deptConfig.isActive,
        },
        create: {
          classId,
          departmentId: deptConfig.departmentId,
          isActive: deptConfig.isActive,
        },
      });
    });

    await this.db.$transaction(operations);

    // Return updated class-department relationships
    return this.db.classDepartment.findMany({
      where: {
        classId,
        departmentId: { in: departmentIds },
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        department: {
          name: 'asc',
        },
      },
    });
  }

  async getClassDepartments(classId: string) {
    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true, medium: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Get all departments with their class-specific status
    const allDepartments = await this.db.department.findMany({
      where: { isActive: true },
      include: {
        classDepartments: {
          where: { classId },
          select: {
            id: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
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

    return {
      class: classEntity,
      departments: allDepartments.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        isActive: dept.classDepartments[0]?.isActive || false,
        classSpecific: dept.classDepartments[0] || null,
        _count: dept._count,
      })),
    };
  }

  async resetClassDepartments(classId: string) {
    // Validate class exists
    const classEntity = await this.db.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Set all class-department relationships to inactive
    await this.db.classDepartment.updateMany({
      where: { classId },
      data: { isActive: false },
    });

    return { message: `All departments for class ${classEntity.name} have been reset to inactive status` };
  }
}
