import { Controller, Get } from '@nestjs/common';
import { BaseResponse } from '../common/response/base-response';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return BaseResponse.success({ status: 'ok' });
  }
}
