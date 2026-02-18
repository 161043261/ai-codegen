import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import type { Request } from 'express';
import { UserEntity } from '../database/entities/user-entity';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserAddDto } from './dto/user-add.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { LoginUserVo, UserVo } from './vo/user.vo';
import { BusinessException } from '../common/exceptions/biz-exception';
import { ErrorCode } from '../common/enums/error-code.js';
import { UserRole } from '../common/enums/user-role';
import { USER_LOGIN_STATE } from '../common/constants';
import { md5Hash } from '../common/utils/crypto.util';
import type { FindOptionsWhere, FindOptionsOrder } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async register(dto: UserRegisterDto): Promise<string> {
    const { userAccount, userPassword, checkPassword } = dto;
    if (userPassword !== checkPassword) {
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        'The two passwords do not match',
      );
    }
    if (userAccount.length < 4) {
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        'The user account is too short',
      );
    }
    if (userPassword.length < 8) {
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        "The user's password is too short",
      );
    }

    const existUser = await this.userRepository.findOne({
      where: { userAccount, isDelete: 0 },
    });
    if (existUser) {
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        'The account already exists',
      );
    }

    const encryptPassword = md5Hash(userPassword);
    const user = this.userRepository.create({
      userAccount,
      userPassword: encryptPassword,
    });
    const saved = await this.userRepository.save(user);
    return String(saved.id);
  }

  async login(
    dto: UserLoginDto,
    request: Request,
  ): Promise<LoginUserVo | null> {
    const { userAccount, userPassword } = dto;
    if (userAccount.length < 4) {
      throw new BusinessException(ErrorCode.PARAMS_ERROR, 'Account error');
    }
    if (userPassword.length < 8) {
      throw new BusinessException(ErrorCode.PARAMS_ERROR, 'Incorrect password');
    }

    const encryptPassword = md5Hash(userPassword);
    const user = await this.userRepository.findOne({
      where: { userAccount, userPassword: encryptPassword, isDelete: 0 },
    });
    if (!user) {
      this.logger.warn(`User login failed, userAccount: ${userAccount}`);
      throw new BusinessException(
        ErrorCode.PARAMS_ERROR,
        'The user does not exist or the password is incorrect',
      );
    }

    const loginUserVo = LoginUserVo.fromEntity(user);
    request.session[USER_LOGIN_STATE] = loginUserVo ?? undefined;
    return loginUserVo;
  }

  async getLoginUser(request: Request): Promise<LoginUserVo | null> {
    const loginUser = request.session?.[USER_LOGIN_STATE];
    if (!loginUser || !loginUser.id) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }
    const user = await this.userRepository.findOne({
      where: { id: Number(loginUser.id), isDelete: 0 },
    });
    if (!user) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }
    return LoginUserVo.fromEntity(user);
  }

  logout(request: Request): Promise<boolean> {
    const loginUser = request.session?.[USER_LOGIN_STATE];
    if (!loginUser) {
      throw new BusinessException(
        ErrorCode.OPERATION_ERROR,
        'User not logged in',
      );
    }
    delete request.session[USER_LOGIN_STATE];
    return Promise.resolve(true);
  }

  async addUser(dto: UserAddDto): Promise<string> {
    const encryptPassword = md5Hash(dto.userPassword);
    const user = this.userRepository.create({
      userAccount: dto.userAccount,
      userPassword: encryptPassword,
      username: dto.username,
      userAvatar: dto.userAvatar,
      userRole: dto.userRole ?? UserRole.USER,
    });
    const saved = await this.userRepository.save(user);
    return String(saved.id);
  }

  async getUserById(id: number): Promise<UserEntity> {
    if (!id || id <= 0) {
      throw new BusinessException(ErrorCode.PARAMS_ERROR);
    }
    const user = await this.userRepository.findOne({
      where: { id, isDelete: 0 },
    });
    if (!user) {
      throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
    }
    return user;
  }

  async getUserVoById(id: number): Promise<UserVo | null> {
    const user = await this.getUserById(id);
    return UserVo.fromEntity(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.getUserById(id);
    user.isDelete = 1;
    await this.userRepository.save(user);
    return true;
  }

  async updateUser(dto: UserUpdateDto): Promise<boolean> {
    const user = await this.getUserById(dto.id);
    if (dto.username !== undefined) user.username = dto.username;
    if (dto.userAvatar !== undefined) user.userAvatar = dto.userAvatar;
    if (dto.userProfile !== undefined) user.userProfile = dto.userProfile;
    if (dto.userRole !== undefined) user.userRole = dto.userRole;
    await this.userRepository.save(user);
    return true;
  }

  async listUserVoByPage(
    dto: UserQueryDto,
  ): Promise<{ records: UserVo[]; total: number }> {
    const {
      current = 1,
      pageSize = 10,
      id,
      username,
      userProfile,
      userRole,
      sortField,
      sortOrder,
    } = dto;
    const where: FindOptionsWhere<UserEntity> = { isDelete: 0 };

    if (id) where.id = id;
    if (userRole) where.userRole = userRole;
    if (username) where.username = Like(`%${username}%`);
    if (userProfile) where.userProfile = Like(`%${userProfile}%`);

    const order: FindOptionsOrder<UserEntity> = {};
    if (sortField && sortField in new UserEntity()) {
      order[sortField] = sortOrder === 'ascend' ? 'ASC' : 'DESC';
    } else {
      order.createTime = 'DESC';
    }

    const [entities, total] = await this.userRepository.findAndCount({
      where,
      order,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      records: entities
        .map((e) => UserVo.fromEntity(e))
        .filter((v): v is UserVo => v !== null),
      total,
    };
  }
}
