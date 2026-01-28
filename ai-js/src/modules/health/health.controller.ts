import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "../../common/decorators/auth.decorator";

@ApiTags("健康检查")
@Controller("health")
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: "健康检查" })
  health() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
