package com.github.tianchenghang.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.github.tianchenghang.common.PageRequest;
import com.github.tianchenghang.constants.UserConstant;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.mapper.UserMapper;
import com.github.tianchenghang.model.dto.user.UserQueryRequest;
import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.enums.UserRole;
import com.github.tianchenghang.model.vo.LoginUserVo;
import com.github.tianchenghang.model.vo.UserVo;
import com.github.tianchenghang.service.UserService;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

  @Override
  public long userRegister(String userAccount, String userPassword, String checkPassword) {
    if (StrUtil.hasBlank(userAccount, userPassword, checkPassword)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "参数为空");
    }
    if (userAccount.length() < 4) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "账号长度过短");
    }
    if (userPassword.length() < 8 || checkPassword.length() < 8) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "密码长度过短");
    }
    if (!userPassword.equals(checkPassword)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "两次输入的密码不同");
    }
    var queryWrapper = new QueryWrapper();
    queryWrapper.eq("user_account", userAccount);
    var count = this.mapper.selectCountByQuery(queryWrapper);
    if (count > 0) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "账号已存在");
    }
    var encryptPassword = getEncryptPassword(userPassword);
    var user = new User();
    user.setUserAccount(userAccount);
    user.setUserPassword(encryptPassword);
    user.setUsername("魔丸");
    user.setUserRole(UserRole.USER.getValue());
    var ok = this.save(user);
    if (!ok) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "注册失败");
    }
    return user.getId();
  }

  @Override
  public LoginUserVo getLoginUserVo(User user) {
    if (user == null) {
      return null;
    }
    var loginUserVo = new LoginUserVo();
    BeanUtil.copyProperties(user, loginUserVo);
    return loginUserVo;
  }

  @Override
  public LoginUserVo userLogin(
      String userAccount, String userPassword, HttpServletRequest request) {
    if (StrUtil.hasBlank(userAccount, userPassword)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "参数为空");
    }
    if (userAccount.length() < 4) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "账号长度过短");
    }
    if (userPassword.length() < 8) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "密码长度过短");
    }
    var encryptPassword = getEncryptPassword(userPassword);
    var queryWrapper = new QueryWrapper();
    queryWrapper.eq("user_account", userAccount);
    queryWrapper.eq("user_password", encryptPassword);
    var user = this.mapper.selectOneByQuery(queryWrapper);
    if (user == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "用户不存在, 或密码错误");
    }
    request.getSession().setAttribute(UserConstant.LOGIN_STATE, user);
    return this.getLoginUserVo(user);
  }

  @Override
  public User getLoginUser(HttpServletRequest request) {
    var userObj = request.getSession().getAttribute(UserConstant.LOGIN_STATE);
    var currentUser = (User) userObj;
    if (currentUser == null || currentUser.getId() == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }
    var userId = currentUser.getId();
    currentUser = this.getById(userId);
    if (currentUser == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }
    return currentUser;
  }

  @Override
  public UserVo getUserVo(User user) {
    if (user == null) {
      return null;
    }
    var userVo = new UserVo();
    BeanUtil.copyProperties(user, userVo);
    return userVo;
  }

  @Override
  public List<UserVo> getUserVoList(List<User> userList) {
    if (CollUtil.isEmpty(userList)) {
      return new ArrayList<>();
    }
    return userList.stream().map(this::getUserVo).collect(Collectors.toList());
  }

  @Override
  public boolean userLogout(HttpServletRequest request) {
    var userObj = request.getSession().getAttribute(UserConstant.LOGIN_STATE);
    if (userObj == null) {
      throw new BusinessException(ErrorCode.OPERATION_FAILED, "用户未登录");
    }
    request.getSession().removeAttribute(UserConstant.LOGIN_STATE);
    return true;
  }

  @Override
  public QueryWrapper getQueryWrapper(UserQueryRequest userQueryRequest) {
    if (userQueryRequest == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "请求参数为空");
    }
    var id = userQueryRequest.getId();
    var userAccount = userQueryRequest.getUserAccount();
    var username = userQueryRequest.getUsername();
    var userProfile = userQueryRequest.getUserProfile();
    var userRole = userQueryRequest.getUserRole();
    var sortField = userQueryRequest.getSortField();
    var sortOrder = userQueryRequest.getSortOrder();
    return QueryWrapper.create()
        .eq("id", id) // where id = ${id}
        .eq("user_role", userRole) // and user_role = ${userRole}
        .like("user_account", userAccount)
        .like("username", username)
        .like("user_profile", userProfile)
        .orderBy(sortField, PageRequest.SortOrder.ASC.equals(sortOrder));
  }

  @Override
  public String getEncryptPassword(String userPassword) {
    final var SALT = "lark";
    return DigestUtils.md5DigestAsHex((userPassword + SALT).getBytes(StandardCharsets.UTF_8));
  }
}
