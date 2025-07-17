/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { FilterExamDto } from './dto/filter-exam.dto';
import { UpdateExamListDto } from './dto/exam-list.dto';
import { SaveExamSetupDto } from './dto/save-exam-setup.dto';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiResponse({ status: 201, description: 'Exam created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.create(createExamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exams with optional filtering' })
  @ApiResponse({ status: 200, description: 'Exams retrieved successfully' })
  @ApiQuery({
    name: 'medium',
    required: false,
    description: 'Filter by medium',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    description: 'Filter by class ID',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    description: 'Filter by section ID',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filter by subject ID',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by exam type',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    description: 'Filter by teacher ID',
  })
  findAll(@Query() filterDto: FilterExamDto) {
    return this.examsService.findAll(filterDto);
  }



  @Get('list')
  @ApiOperation({ summary: 'Get exam list in frontend format' })
  @ApiResponse({ status: 200, description: 'Exam list retrieved successfully' })
  @ApiQuery({
    name: 'classId',
    required: false,
    description: 'Filter by class ID',
  })
  @ApiQuery({
    name: 'medium',
    required: false,
    description: 'Filter by medium',
  })
  getExamList(
    @Query('classId') classId?: string,
    @Query('medium') medium?: string,
  ) {
    return this.examsService.getExamList(classId, medium);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam by ID' })
  @ApiResponse({ status: 200, description: 'Exam retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update exam by ID' })
  @ApiResponse({ status: 200, description: 'Exam updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exam by ID (soft delete)' })
  @ApiResponse({ status: 200, description: 'Exam deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  @Patch('list/:id')
  @ApiOperation({ summary: 'Update exam list item' })
  @ApiResponse({
    status: 200,
    description: 'Exam list item updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  updateExamListItem(
    @Param('id') id: string,
    @Body() updateData: UpdateExamListDto,
  ) {
    return this.examsService.updateExamListItem(id, updateData);
  }

  @Post('list/save')
  @ApiOperation({ summary: 'Save exam setup configuration (bulk update)' })
  @ApiResponse({
    status: 200,
    description: 'Exam setup saved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  saveExamSetup(@Body() setupData: SaveExamSetupDto) {
    return this.examsService.saveExamSetup(setupData);
  }
}
