package com.github.tianchenghang.controller;

import cn.hutool.core.bean.BeanUtil;
import com.github.tianchenghang.annotation.AuthCheck;
import com.github.tianchenghang.common.BaseResponse;
import com.github.tianchenghang.common.DeleteRequest;
import com.github.tianchenghang.common.ResultUtil;
import com.github.tianchenghang.constants.UserConstant;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.dto.user.*;
import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.vo.LoginUserVo;
import com.github.tianchenghang.model.vo.UserVo;
import com.github.tianchenghang.service.UserService;
import com.mybatisflex.core.paginate.Page;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
  @Resource private UserService userService;

  @PostMapping("/register")
  public BaseResponse<Long> userRegister(@RequestBody UserRegisterRequest userRegisterRequest) {
    if (userRegisterRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var userAccount = userRegisterRequest.getUserAccount();
    var userPassword = userRegisterRequest.getUserPassword();
    var checkPassword = userRegisterRequest.getCheckPassword();
    var result = userService.userRegister(userAccount, userPassword, checkPassword);
    return ResultUtil.success(result);
  }

  @PostMapping("/login")
  public BaseResponse<LoginUserVo> userLogin(
      @RequestBody UserLoginRequest userLoginRequest, HttpServletRequest request) {
    if (userLoginRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var userAccount = userLoginRequest.getUserAccount();
    var userPassword = userLoginRequest.getUserPassword();
    var loginUserVo = userService.userLogin(userAccount, userPassword, request);
    return ResultUtil.success(loginUserVo);
  }

  @GetMapping("/get/login")
  public BaseResponse<LoginUserVo> getLoginUser(HttpServletRequest request) {
    var loginUser = userService.getLoginUser(request);
    return ResultUtil.success(userService.getLoginUserVo(loginUser));
  }

  @PostMapping("/logout")
  public BaseResponse<Boolean> userLogout(HttpServletRequest request) {
    if (request == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var result = userService.userLogout(request);
    return ResultUtil.success(result);
  }

  @PostMapping("/add")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<Long> addUser(@RequestBody UserAddRequest userAddRequest) {
    if (userAddRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var user = new User();
    BeanUtil.copyProperties(userAddRequest, user);
    final String DEFAULT_PASSWORD = "pass";
    var encryptPassword = userService.getEncryptPassword(DEFAULT_PASSWORD);
    user.setUserPassword(encryptPassword);
    var ok = userService.save(user);
    if (!ok) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED);
    }
    return ResultUtil.success(user.getId());
  }

  @GetMapping("/get")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<User> getUserById(long id) {
    if (id <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var user = userService.getById(id);
    if (user == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }
    return ResultUtil.success(user);
  }

  @GetMapping("/get/vo")
  public BaseResponse<UserVo> getUserVOById(long id) {
    var response = getUserById(id);
    var user = response.getData();
    return ResultUtil.success(userService.getUserVo(user));
  }

  @PostMapping("/delete")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<Boolean> deleteUser(@RequestBody DeleteRequest deleteRequest) {
    if (deleteRequest == null || deleteRequest.getId() <= 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var result = userService.removeById(deleteRequest.getId());
    return ResultUtil.success(result);
  }

  @PostMapping("/update")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<Boolean> updateUser(@RequestBody UserUpdateRequest userUpdateRequest) {
    if (userUpdateRequest == null || userUpdateRequest.getId() == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var user = new User();
    BeanUtil.copyProperties(userUpdateRequest, user);
    var ok = userService.updateById(user);
    if (!ok) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED);
    }
    return ResultUtil.success(true);
  }

  @PostMapping("/list/page/vo")
  @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
  public BaseResponse<Page<UserVo>> listUserVoByPage(
      @RequestBody UserQueryRequest userQueryRequest) {
    if (userQueryRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST);
    }
    var pageNum = userQueryRequest.getPageNum();
    var pageSize = userQueryRequest.getPageSize();
    var userPage =
        userService.page(Page.of(pageNum, pageSize), userService.getQueryWrapper(userQueryRequest));
    var userVoPage = new Page<UserVo>(pageNum, pageSize, userPage.getTotalRow());
    var userVoList = userService.getUserVoList(userPage.getRecords());
    userVoPage.setRecords(userVoList);
    return ResultUtil.success(userVoPage);
  }
}
