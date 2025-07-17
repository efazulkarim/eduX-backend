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
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import {
  BulkUpdateSectionDto,
  SectionSetupDto,
} from './dto/bulk-update-section.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new section' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid section data or duplicate',
  })
  @ApiResponse({ status: 404, description: 'Class or department not found' })
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sections with pagination' })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.sectionsService.findAll(paginationDto);
  }

  @Get('by-class/:classId')
  @ApiOperation({ summary: 'Get sections by class ID' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Sections for class retrieved' })
  findByClass(
    @Param('classId') classId: string,
    @Query('departmentId') departmentId?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.sectionsService.findByClass(
      classId,
      departmentId,
      paginationDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiResponse({ status: 200, description: 'Section retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a section' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data or duplicate' })
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a section' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete section with students',
  })
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }

  @Post('setup')
  @ApiOperation({
    summary:
      'Setup sections for a class with active/inactive status and teacher assignments',
  })
  @ApiResponse({
    status: 200,
    description: 'Sections setup completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid section configuration' })
  setupSections(@Body() sectionSetupDto: SectionSetupDto) {
    return this.sectionsService.setupSections(sectionSetupDto);
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update sections active status' })
  @ApiResponse({ status: 200, description: 'Sections updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid section IDs' })
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateSectionDto) {
    return this.sectionsService.bulkUpdate(bulkUpdateDto);
  }

  @Post('reset/:classId')
  @ApiOperation({
    summary: 'Reset all sections for a class to inactive status',
  })
  @ApiResponse({ status: 200, description: 'Sections reset successfully' })
  resetSections(
    @Param('classId') classId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.sectionsService.resetSections(classId, departmentId);
  }
}
