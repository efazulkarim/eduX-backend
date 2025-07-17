import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  Header,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { StudentsService } from './students.service';
import { AdmissionFormService } from './admission-form.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FilterStudentDto } from './dto/filter-student.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly admissionFormService: AdmissionFormService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new student profile' })
  @ApiResponse({ status: 201, description: 'Student created' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Students retrieved' })
  findAll(@Query() filterDto: FilterStudentDto) {
    return this.studentsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({ status: 200, description: 'Student updated' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a student' })
  @ApiResponse({ status: 200, description: 'Student deleted' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Get('admission-form/blank')
  @ApiOperation({ summary: 'Download blank admission form' })
  @ApiResponse({ status: 200, description: 'Blank admission form PDF' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="blank-admission-form.pdf"')
  async downloadBlankAdmissionForm(@Res() res: Response) {
    try {
      const pdfBuffer = await this.admissionFormService.generateBlankAdmissionForm();
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate admission form' });
    }
  }

  @Get(':id/admission-form')
  @ApiOperation({ summary: 'Download filled admission form for a student' })
  @ApiResponse({ status: 200, description: 'Filled admission form PDF' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Header('Content-Type', 'application/pdf')
  async downloadStudentAdmissionForm(@Param('id') id: string, @Res() res: Response) {
    try {
      const student = await this.studentsService.findOne(id);
      const pdfBuffer = await this.admissionFormService.generateFilledAdmissionForm(id);
      
      const filename = `admission-form-${student.firstName}-${student.lastName}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      if (error.message === 'Student not found') {
        res.status(404).json({ error: 'Student not found' });
      } else {
        res.status(500).json({ error: 'Failed to generate admission form' });
      }
    }
  }
}
