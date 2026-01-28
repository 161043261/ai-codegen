import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "./entities/user.entity";
import { UserVO, LoginUserVO } from "./vo/user.vo";
import {
  UserRegisterDto,
  UserLoginDto,
  UserAddDto,
  UserUpdateDto,
  UserQueryDto,
} from "./dto/user.dto";
import { BusinessException } from "../../common/business.exception";
import { PageResponse } from "../../common/base-response";

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 用户注册
   */
  async register(dto: UserRegisterDto): Promise<string> {
    const { userAccount, userPassword, checkPassword } = dto;

    // 校验
    if (userPassword !== checkPassword) {
      throw BusinessException.paramsError("两次输入的密码不一致");
    }

    if (userAccount.length < 4) {
      throw BusinessException.paramsError("账号长度不能小于4位");
    }

    if (userPassword.length < 8) {
      throw BusinessException.paramsError("密码长度不能小于8位");
    }

    // 检查账号是否已存在
    const existUser = await this.userRepository.findOne({
      where: { userAccount, isDelete: 0 },
    });
    if (existUser) {
      throw BusinessException.paramsError("账号已存在");
    }

    // 加密密码
    const encryptPassword = await bcrypt.hash(userPassword, SALT_ROUNDS);

    // 创建用户
    const user = new User();
    user.userAccount = userAccount;
    user.userPassword = encryptPassword;

    const savedUser = await this.userRepository.save(user);
    return savedUser.id;
  }

  /**
   * 用户登录
   */
  async login(dto: UserLoginDto): Promise<LoginUserVO> {
    const { userAccount, userPassword } = dto;

    if (userAccount.length < 4) {
      throw BusinessException.paramsError("账号长度不能小于4位");
    }

    const user = await this.userRepository.findOne({
      where: { userAccount, isDelete: 0 },
    });

    if (!user) {
      throw BusinessException.paramsError("用户不存在或密码错误");
    }

    const isPasswordValid = await bcrypt.compare(
      userPassword,
      user.userPassword,
    );
    if (!isPasswordValid) {
      throw BusinessException.paramsError("用户不存在或密码错误");
    }

    return LoginUserVO.fromEntity(user);
  }

  /**
   * 获取用户信息
   */
  async getById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDelete: 0 },
    });
  }

  /**
   * 获取用户 VO
   */
  async getUserVO(id: string): Promise<UserVO | null> {
    const user = await this.getById(id);
    if (!user) {
      return null;
    }
    return UserVO.fromEntity(user);
  }

  /**
   * 创建用户（管理员）
   */
  async addUser(dto: UserAddDto): Promise<string> {
    const encryptPassword = await bcrypt.hash(dto.userPassword, SALT_ROUNDS);

    const user = new User();
    user.userAccount = dto.userAccount;
    user.userPassword = encryptPassword;
    user.userName = dto.userName;
    user.userAvatar = dto.userAvatar;
    user.userRole = dto.userRole || "user";

    const savedUser = await this.userRepository.save(user);
    return savedUser.id;
  }

  /**
   * 更新用户
   */
  async updateUser(dto: UserUpdateDto): Promise<boolean> {
    const user = await this.getById(dto.id);
    if (!user) {
      throw BusinessException.notFound("用户不存在");
    }

    if (dto.userName !== undefined) user.userName = dto.userName;
    if (dto.userAvatar !== undefined) user.userAvatar = dto.userAvatar;
    if (dto.userProfile !== undefined) user.userProfile = dto.userProfile;
    if (dto.userRole !== undefined) user.userRole = dto.userRole;

    await this.userRepository.save(user);
    return true;
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<boolean> {
    const user = await this.getById(id);
    if (!user) {
      throw BusinessException.notFound("用户不存在");
    }

    user.isDelete = 1;
    await this.userRepository.save(user);
    return true;
  }

  /**
   * 分页查询用户
   */
  async listUserByPage(dto: UserQueryDto): Promise<PageResponse<UserVO>> {
    const {
      pageNum = 1,
      pageSize = 10,
      id,
      userAccount,
      userName,
      userRole,
      sortField,
      sortOrder,
    } = dto;

    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .where("user.isDelete = :isDelete", { isDelete: 0 });

    if (id) {
      queryBuilder.andWhere("user.id = :id", { id });
    }
    if (userAccount) {
      queryBuilder.andWhere("user.userAccount LIKE :userAccount", {
        userAccount: `%${userAccount}%`,
      });
    }
    if (userName) {
      queryBuilder.andWhere("user.userName LIKE :userName", {
        userName: `%${userName}%`,
      });
    }
    if (userRole) {
      queryBuilder.andWhere("user.userRole = :userRole", { userRole });
    }

    // 排序
    if (sortField) {
      const order = sortOrder === "ascend" ? "ASC" : "DESC";
      queryBuilder.orderBy(`user.${sortField}`, order);
    } else {
      queryBuilder.orderBy("user.createTime", "DESC");
    }

    queryBuilder.skip((pageNum - 1) * pageSize).take(pageSize);

    const [users, total] = await queryBuilder.getManyAndCount();
    const records = users.map((user) => UserVO.fromEntity(user));

    return new PageResponse(records, total, pageNum, pageSize);
  }

  /**
   * 批量获取用户
   */
  async listByIds(ids: string[]): Promise<User[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.id IN (:...ids)", { ids })
      .andWhere("user.isDelete = :isDelete", { isDelete: 0 })
      .getMany();
  }
}
