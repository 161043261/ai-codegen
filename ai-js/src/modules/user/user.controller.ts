import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";
import { UserService } from "./user.service";
import {
  UserRegisterDto,
  UserLoginDto,
  UserAddDto,
  UserUpdateDto,
  UserQueryDto,
} from "./dto/user.dto";
import { UserVO, LoginUserVO } from "./vo/user.vo";
import { BaseResponse, PageResponse } from "../../common/base-response";
import {
  Public,
  Roles,
  CurrentUser,
} from "../../common/decorators/auth.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { DeleteRequestDto } from "../../common/dto/page.dto";
import { BusinessException } from "../../common/business.exception";

@ApiTags("用户")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: "用户注册" })
  async register(@Body() dto: UserRegisterDto): Promise<BaseResponse<string>> {
    const userId = await this.userService.register(dto);
    return BaseResponse.success(userId);
  }

  @Post("login")
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: "用户登录" })
  async login(
    @Body() dto: UserLoginDto,
    @Req() request: Request,
  ): Promise<BaseResponse<LoginUserVO>> {
    const loginUserVO = await this.userService.login(dto);
    // 保存到 session
    (request.session as any).user = loginUserVO;
    return BaseResponse.success(loginUserVO);
  }

  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "用户注销" })
  async logout(@Req() request: Request): Promise<BaseResponse<boolean>> {
    (request.session as any).user = null;
    return BaseResponse.success(true);
  }

  @Get("get/login")
  @ApiOperation({ summary: "获取当前登录用户" })
  async getLoginUser(
    @CurrentUser() user: LoginUserVO,
  ): Promise<BaseResponse<LoginUserVO>> {
    if (!user) {
      throw BusinessException.notLogin();
    }
    // 从数据库获取最新信息
    const userVO = await this.userService.getUserVO(user.id);
    if (!userVO) {
      throw BusinessException.notLogin();
    }
    return BaseResponse.success(userVO as LoginUserVO);
  }

  // ==================== 管理员接口 ====================

  @Post("add")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: "创建用户（管理员）" })
  async addUser(@Body() dto: UserAddDto): Promise<BaseResponse<string>> {
    const userId = await this.userService.addUser(dto);
    return BaseResponse.success(userId);
  }

  @Get("get")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "根据ID获取用户（管理员）" })
  async getUserById(@Query("id") id: string): Promise<BaseResponse<UserVO>> {
    if (!id) {
      throw BusinessException.paramsError("ID不能为空");
    }
    const user = await this.userService.getUserVO(id);
    if (!user) {
      throw BusinessException.notFound("用户不存在");
    }
    return BaseResponse.success(user);
  }

  @Post("update")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: "更新用户（管理员）" })
  async updateUser(@Body() dto: UserUpdateDto): Promise<BaseResponse<boolean>> {
    const result = await this.userService.updateUser(dto);
    return BaseResponse.success(result);
  }

  @Post("delete")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: "删除用户（管理员）" })
  async deleteUser(
    @Body() dto: DeleteRequestDto,
  ): Promise<BaseResponse<boolean>> {
    const result = await this.userService.deleteUser(dto.id);
    return BaseResponse.success(result);
  }

  @Post("list/page/vo")
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: "分页获取用户列表（管理员）" })
  async listUserByPage(
    @Body() dto: UserQueryDto,
  ): Promise<BaseResponse<PageResponse<UserVO>>> {
    const page = await this.userService.listUserByPage(dto);
    return BaseResponse.success(page);
  }
}
