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
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto, Medium } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { BulkUpdateClassDto, ClassSetupDto } from './dto/bulk-update-class.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Class already exists' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes with pagination' })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.classesService.findAll(paginationDto);
  }

  @Get('by-medium')
  @ApiOperation({ summary: 'Get classes filtered by medium' })
  @ApiQuery({ name: 'medium', required: false, enum: Medium })
  @ApiResponse({ status: 200, description: 'Classes retrieved by medium' })
  getClassesByMedium(@Query('medium') medium?: Medium) {
    return this.classesService.getClassesByMedium(medium);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiResponse({ status: 200, description: 'Class retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 400, description: 'Duplicate class name' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete class with students',
  })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  @Post('setup')
  @ApiOperation({ summary: 'Setup classes with bulk active/inactive status' })
  @ApiResponse({
    status: 200,
    description: 'Classes setup completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid class configuration' })
  setupClasses(@Body() classSetupDto: ClassSetupDto) {
    return this.classesService.setupClasses(classSetupDto);
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update classes active status' })
  @ApiResponse({ status: 200, description: 'Classes updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid class IDs' })
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateClassDto) {
    return this.classesService.bulkUpdate(bulkUpdateDto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset all classes to inactive status' })
  @ApiResponse({ status: 200, description: 'Classes reset successfully' })
  resetClasses() {
    return this.classesService.resetClasses();
  }
}
