import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles.constant';

@ApiTags('Staff Management')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Staff Management Endpoints
  @Post('staff')
  // @Roles(ROLES.ADMIN) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({ status: 201, description: 'Staff created successfully' })
  @ApiResponse({ status: 409, description: 'Email or Employee ID already exists' })
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.usersService.createStaff(createStaffDto);
  }

  @Get('staff')
  // @Roles(ROLES.ADMIN) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Get all staff members' })
  @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
  findAllStaff(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAllStaff(paginationDto);
  }

  @Get('teachers')
  // @Roles(ROLES.ADMIN) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Get all teachers (staff with TEACHER role)' })
  @ApiResponse({ status: 200, description: 'Teachers retrieved successfully' })
  findAllTeachers(@Query() paginationDto: PaginationDto) {
    return this.usersService.findTeachers(paginationDto);
  }

  @Get('staff/:id')
  // @Roles(ROLES.ADMIN) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Get a staff member by ID' })
  @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  findOneStaff(@Param('id') id: string) {
    return this.usersService.findStaffById(id);
  }

  @Patch('staff/:id')
  // @Roles(ROLES.ADMIN) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Update a staff member (partial update)' })
  @ApiResponse({ status: 200, description: 'Staff updated successfully' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  updateStaff(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.usersService.updateStaff(id, updateStaffDto);
  }

  @Put('staff/:id')
  // @Roles(ROLES.ADMIN) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Update a staff member (full update)' })
  @ApiResponse({ status: 200, description: 'Staff updated successfully' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  updateStaffFull(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.usersService.updateStaff(id, updateStaffDto);
  }

  @Delete('staff/:id')
  // @Roles(ROLES.ADMIN) // Temporarily disabled for testing
  @ApiOperation({ summary: 'Delete a staff member' })
  @ApiResponse({ status: 200, description: 'Staff deleted successfully' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  removeStaff(@Param('id') id: string) {
    return this.usersService.removeStaff(id);
  }
}
