import { Controller, Get } from '@nestjs/common';

@Controller('staff-test')
export class StaffTestController {
  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      message: 'Staff module is working',
      timestamp: new Date().toISOString(),
      endpoints: {
        staff: '/staff',
        queue: '/queue', 
        notifications: '/notifications'
      }
    };
  }
}