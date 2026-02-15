import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserAddDto } from './dto/user-add.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { DeleteRequestDto } from '../common/dto/delete-request-dto';
import { BaseResponse } from '../common/response/base-response';
import { AuthCheck } from '../common/guards/auth.guard';
import { UserRole } from '../common/enums/user-role';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: UserRegisterDto) {
    const id = await this.userService.register(dto);
    return BaseResponse.success(id);
  }

  @Post('login')
  async login(@Body() dto: UserLoginDto, @Req() request: Request) {
    const loginUserVo = await this.userService.login(dto, request);
    return BaseResponse.success(loginUserVo);
  }

  @Get('get/login')
  @AuthCheck()
  async getLoginUser(@Req() request: Request) {
    const loginUser = await this.userService.getLoginUser(request);
    return BaseResponse.success(loginUser);
  }

  @Post('logout')
  @AuthCheck()
  async logout(@Req() request: Request) {
    const result = await this.userService.logout(request);
    return BaseResponse.success(result);
  }

  @Post('add')
  @AuthCheck(UserRole.ADMIN)
  async addUser(@Body() dto: UserAddDto) {
    const id = await this.userService.addUser(dto);
    return BaseResponse.success(id);
  }

  @Get('get')
  @AuthCheck(UserRole.ADMIN)
  async getUserById(@Query('id') id: number) {
    const user = await this.userService.getUserById(id);
    return BaseResponse.success(user);
  }

  @Get('get/vo')
  async getUserVoById(@Query('id') id: number) {
    const userVo = await this.userService.getUserVoById(id);
    return BaseResponse.success(userVo);
  }

  @Post('delete')
  @AuthCheck(UserRole.ADMIN)
  async deleteUser(@Body() dto: DeleteRequestDto) {
    const result = await this.userService.deleteUser(dto.id);
    return BaseResponse.success(result);
  }

  @Post('update')
  @AuthCheck(UserRole.ADMIN)
  async updateUser(@Body() dto: UserUpdateDto) {
    const result = await this.userService.updateUser(dto);
    return BaseResponse.success(result);
  }

  @Post('list/page/vo')
  @AuthCheck(UserRole.ADMIN)
  async listUserVoByPage(@Body() dto: UserQueryDto) {
    const result = await this.userService.listUserVoByPage(dto);
    return BaseResponse.success(result);
  }
}
