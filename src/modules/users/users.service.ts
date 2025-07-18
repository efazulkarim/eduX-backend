import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  // Staff Management Methods
  async createStaff(createStaffDto: CreateStaffDto) {
    const { educations, experiences, password, ...staffData } = createStaffDto;

    // Check if email already exists
    const existingUser = await this.findByEmail(createStaffDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check if employeeId already exists
    const existingStaff = await this.db.staff.findUnique({
      where: { employeeId: createStaffDto.employeeId },
    });
    if (existingStaff) {
      throw new ConflictException('Employee ID already exists');
    }

    // Hash password only if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create user and staff in transaction
    return this.db.$transaction(async (tx) => {
      try {
        // Create user
        const user = await tx.user.create({
          data: {
            email: createStaffDto.email,
            password: hashedPassword,
            role: createStaffDto.role,
            firstName: createStaffDto.firstName,
            lastName: createStaffDto.lastName,
            phone: createStaffDto.phone,
          },
        });

        // Create staff
        const staff = await tx.staff.create({
          data: {
            userId: user.id,
            employeeId: staffData.employeeId,
            role: staffData.staffRole,
            idNo: staffData.idNo,
            hfId: staffData.hfId,
            dateOfBirth: staffData.dateOfBirth ? new Date(staffData.dateOfBirth) : null,
            joiningDate: staffData.joiningDate ? new Date(staffData.joiningDate) : new Date(),
            bloodGroup: staffData.bloodGroup,
            gender: staffData.gender,
            religion: staffData.religion,
            medium: staffData.medium,
            department: staffData.department,
            designation: staffData.designation,
            shift: staffData.shift,
            nid: staffData.nid,
            birthCertNo: staffData.birthCertNo,
            serialNo: staffData.serialNo,
            presentAddress: staffData.presentAddress,
            permanentAddress: staffData.permanentAddress,
            // Teacher-specific fields
            qualification: staffData.qualification,
            experience: staffData.experience,
            salary: staffData.salary,
            address: staffData.address,
            isActive: staffData.isActive ?? true,
          },
        });

        // Create educations if provided
        if (educations && educations.length > 0) {
          await tx.staffEducation.createMany({
            data: educations.map(edu => ({
              staffId: staff.id,
              ...edu,
            })),
          });
        }

        // Create experiences if provided
        if (experiences && experiences.length > 0) {
          await tx.staffExperience.createMany({
            data: experiences.map(exp => ({
              staffId: staff.id,
              ...exp,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
            })),
          });
        }

        // Return the created staff with all relations
        return await tx.staff.findUnique({
          where: { id: staff.id },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            educations: true,
            experiences: true,
          },
        });
      } catch (error) {
        console.error('Error creating staff:', error);
        throw error;
      }
    });
  }

  async findAllStaff(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      this.db.staff.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              phone: true,
              isActive: true,
            },
          },
          educations: true,
          experiences: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.db.staff.count(),
    ]);

    return {
      staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findTeachers(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      this.db.staff.findMany({
        where: {
          role: 'TEACHER',
          isActive: true,
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              phone: true,
              isActive: true,
            },
          },
          educations: true,
          experiences: true,
          subjects: {
            include: {
              class: true,
              section: true,
              department: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.db.staff.count({
        where: {
          role: 'TEACHER',
          isActive: true,
        },
      }),
    ]);

    return {
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findStaffById(id: string) {
    const staff = await this.db.staff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        educations: true,
        experiences: true,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return staff;
  }

  async updateStaff(id: string, updateStaffDto: UpdateStaffDto) {
    const { 
      educations, 
      experiences, 
      password, 
      staffRole, 
      // User fields to exclude from staff data
      email,
      firstName,
      lastName,
      phone,
      role,
      ...staffData 
    } = updateStaffDto;
    
    const existingStaff = await this.findStaffById(id);

    return this.db.$transaction(async (tx) => {
      // Update user data if provided
      if (email || firstName || lastName || phone || password) {
        const userData: any = {};
        if (email) userData.email = email;
        if (firstName) userData.firstName = firstName;
        if (lastName) userData.lastName = lastName;
        if (phone) userData.phone = phone;
        if (password) {
          userData.password = await bcrypt.hash(password, 10);
        }

        await tx.user.update({
          where: { id: existingStaff.userId },
          data: userData,
        });
      }

      // Update staff data
      const staff = await tx.staff.update({
        where: { id },
        data: {
          ...staffData,
          role: staffRole,
          dateOfBirth: staffData.dateOfBirth ? new Date(staffData.dateOfBirth) : undefined,
          joiningDate: staffData.joiningDate ? new Date(staffData.joiningDate) : undefined,
        },
      });

      // Update educations if provided
      if (educations) {
        // Delete existing educations
        await tx.staffEducation.deleteMany({
          where: { staffId: id },
        });

        // Create new educations
        if (educations.length > 0) {
          // Filter out educations with missing required fields
          const validEducations = educations.filter(edu => edu.exam && edu.institute);
          
          if (validEducations.length > 0) {
            await tx.staffEducation.createMany({
              data: validEducations.map(edu => ({
                staffId: id,
                exam: edu.exam!,
                institute: edu.institute!,
                gpa: edu.gpa,
                grade: edu.grade,
                passingYear: edu.passingYear,
                board: edu.board,
                duration: edu.duration,
              })),
            });
          }
        }
      }

      // Update experiences if provided
      if (experiences) {
        // Delete existing experiences
        await tx.staffExperience.deleteMany({
          where: { staffId: id },
        });

        // Create new experiences
        if (experiences.length > 0) {
          // Filter out experiences with missing required fields
          const validExperiences = experiences.filter(exp => exp.designation && exp.organization);
          
          if (validExperiences.length > 0) {
            await tx.staffExperience.createMany({
              data: validExperiences.map(exp => ({
                staffId: id,
                designation: exp.designation!,
                organization: exp.organization!,
                address: exp.address,
                duration: exp.duration,
                startDate: exp.startDate ? new Date(exp.startDate) : null,
                endDate: exp.endDate ? new Date(exp.endDate) : null,
              })),
            });
          }
        }
      }

      return this.findStaffById(id);
    });
  }

  async removeStaff(id: string) {
    const staff = await this.findStaffById(id);

    return this.db.$transaction(async (tx) => {
      // First, handle foreign key constraints by nullifying or deleting related records
      
      // Update subjects to remove staff reference
      await tx.subject.updateMany({
        where: { staffId: id },
        data: { staffId: null },
      });

      // Delete attendances related to this staff
      await tx.attendance.deleteMany({
        where: { staffId: id },
      });

      // Delete exams related to this staff
      await tx.exam.deleteMany({
        where: { staffId: id },
      });

      // Delete staff education records (these should cascade)
      await tx.staffEducation.deleteMany({
        where: { staffId: id },
      });

      // Delete staff experience records (these should cascade)
      await tx.staffExperience.deleteMany({
        where: { staffId: id },
      });

      // Now delete the staff record
      await tx.staff.delete({
        where: { id },
      });

      // Delete user
      await tx.user.delete({
        where: { id: staff.userId },
      });

      return { message: 'Staff deleted successfully' };
    });
  }
}
