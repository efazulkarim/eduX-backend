import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  BulkUpdateDepartmentDto,
  DepartmentSetupDto,
} from './dto/bulk-update-department.dto';
import { ClassDepartmentSetupDto } from './dto/class-department.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Department already exists' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.departmentsService.findAll(paginationDto);
  }

  @Get('by-class/:classId')
  @ApiOperation({ summary: 'Get departments available for a specific class' })
  @ApiResponse({ status: 200, description: 'Departments for class retrieved' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findByClass(@Param('classId') classId: string) {
    return this.departmentsService.findByClass(classId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 400, description: 'Duplicate department name' })
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete department with students',
  })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  @Post('setup')
  @ApiOperation({
    summary:
      'Setup departments for a specific class with active/inactive status',
  })
  @ApiResponse({
    status: 200,
    description: 'Departments setup completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid department configuration' })
  setupDepartments(@Body() departmentSetupDto: DepartmentSetupDto) {
    return this.departmentsService.setupDepartments(departmentSetupDto);
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update departments active status' })
  @ApiResponse({ status: 200, description: 'Departments updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid department IDs' })
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateDepartmentDto) {
    return this.departmentsService.bulkUpdate(bulkUpdateDto);
  }

  @Post('reset/:classId')
  @ApiOperation({
    summary: 'Reset all departments for a class to inactive status',
  })
  @ApiResponse({ status: 200, description: 'Departments reset successfully' })
  resetDepartments(@Param('classId') classId: string) {
    return this.departmentsService.resetDepartments(classId);
  }

  // New class-specific department endpoints
  @Get('class-setup/:classId')
  @ApiOperation({
    summary: 'Get departments setup for a specific class with class-specific status',
  })
  @ApiResponse({
    status: 200,
    description: 'Class departments setup retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  getClassDepartments(@Param('classId') classId: string) {
    return this.departmentsService.getClassDepartments(classId);
  }

  @Post('class-setup')
  @ApiOperation({
    summary: 'Setup departments for a specific class using class-department relationships',
  })
  @ApiResponse({
    status: 200,
    description: 'Class departments setup completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid department configuration' })
  @ApiResponse({ status: 404, description: 'Class or department not found' })
  setupClassDepartments(@Body() setupDto: ClassDepartmentSetupDto) {
    return this.departmentsService.setupClassDepartments(setupDto);
  }

  @Post('class-reset/:classId')
  @ApiOperation({
    summary: 'Reset all class-department relationships for a class to inactive status',
  })
  @ApiResponse({ status: 200, description: 'Class departments reset successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  resetClassDepartments(@Param('classId') classId: string) {
    return this.departmentsService.resetClassDepartments(classId);
  }
}
