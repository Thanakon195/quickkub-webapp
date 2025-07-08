import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('logs')
  getSystemLogs() {
    return this.adminService.getSystemLogs();
  }

  @Put('config')
  updateSystemConfig(@Body() config: any) {
    return this.adminService.updateSystemConfig(config);
  }

  @Post('backup')
  backupDatabase() {
    return this.adminService.backupDatabase();
  }

  @Post('restore')
  restoreDatabase(@Body() restoreData: { backupFile: string }) {
    return this.adminService.restoreDatabase(restoreData.backupFile);
  }
}
