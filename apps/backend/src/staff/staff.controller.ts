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
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/create-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  findAll(@Query('role') role?: string, @Query('department') department?: string) {
    if (role) {
      return this.staffService.findByRole(role);
    }
    if (department) {
      return this.staffService.findByDepartment(department);
    }
    return this.staffService.findAll();
  }

  @Get('dashboard/:staffId')
  getDashboard(@Param('staffId') staffId: string) {
    return this.staffService.getDashboardData(staffId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.staffService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: UpdateStaffDto) {
    return this.staffService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}