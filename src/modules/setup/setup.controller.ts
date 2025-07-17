import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { Medium } from '../classes/dto/create-class.dto';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('classes')
  @ApiOperation({ summary: 'Get all classes for medium-wise class setup' })
  @ApiQuery({ name: 'medium', required: false, enum: Medium })
  @ApiResponse({ status: 200, description: 'Classes retrieved for setup' })
  getClassesForSetup(@Query('medium') medium?: Medium) {
    return this.setupService.getClassesForSetup(medium);
  }

  @Post('classes/save')
  @ApiOperation({ summary: 'Save class setup configuration' })
  @ApiResponse({ status: 200, description: 'Class setup saved successfully' })
  saveClassSetup(
    @Body()
    setupData: {
      medium?: string;
      classes: Array<{ id: string; isActive: boolean }>;
    },
  ) {
    return this.setupService.saveClassSetup(setupData);
  }

  @Post('classes/reset')
  @ApiOperation({ summary: 'Reset all classes to inactive' })
  @ApiResponse({ status: 200, description: 'Classes reset successfully' })
  resetClassSetup(@Query('medium') medium?: Medium) {
    return this.setupService.resetClassSetup(medium);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get departments for class-wise department setup' })
  @ApiQuery({ name: 'classId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Departments retrieved for setup' })
  getDepartmentsForSetup(@Query('classId') classId: string) {
    return this.setupService.getDepartmentsForSetup(classId);
  }

  @Post('departments/save')
  @ApiOperation({ summary: 'Save department setup configuration for a class' })
  @ApiResponse({
    status: 200,
    description: 'Department setup saved successfully',
  })
  saveDepartmentSetup(
    @Body()
    setupData: {
      classId: string;
      departments: Array<{ id: string; isActive: boolean }>;
    },
  ) {
    return this.setupService.saveDepartmentSetup(setupData);
  }

  @Post('departments/reset/:classId')
  @ApiOperation({ summary: 'Reset departments for a specific class' })
  @ApiResponse({ status: 200, description: 'Departments reset successfully' })
  resetDepartmentSetup(@Param('classId') classId: string) {
    return this.setupService.resetDepartmentSetup(classId);
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get sections for class and department setup' })
  @ApiQuery({ name: 'classId', required: true, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Sections retrieved for setup' })
  getSectionsForSetup(
    @Query('classId') classId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.setupService.getSectionsForSetup(classId, departmentId);
  }

  @Post('sections/save')
  @ApiOperation({ summary: 'Save section setup configuration' })
  @ApiResponse({ status: 200, description: 'Section setup saved successfully' })
  saveSectionSetup(
    @Body()
    setupData: {
      classId: string;
      departmentId?: string;
      sections: Array<{
        id?: string;
        name: string;
        isActive: boolean;
        teacherId?: string;
      }>;
    },
  ) {
    return this.setupService.saveSectionSetup(setupData);
  }

  @Post('sections/reset')
  @ApiOperation({ summary: 'Reset sections for class/department' })
  @ApiResponse({ status: 200, description: 'Sections reset successfully' })
  resetSectionSetup(
    @Body() resetData: { classId: string; departmentId?: string },
  ) {
    return this.setupService.resetSectionSetup(resetData);
  }
}
