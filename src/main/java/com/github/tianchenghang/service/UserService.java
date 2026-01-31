package com.github.tianchenghang.service;

import com.github.tianchenghang.model.dto.user.UserQueryRequest;
import com.github.tianchenghang.model.entity.User;
import com.github.tianchenghang.model.vo.LoginUserVo;
import com.github.tianchenghang.model.vo.UserVo;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface UserService extends IService<User> {

  long userRegister(String userAccount, String userPassword, String checkPassword);

  LoginUserVo getLoginUserVo(User user);

  LoginUserVo userLogin(String userAccount, String userPassword, HttpServletRequest request);

  User getLoginUser(HttpServletRequest request);

  UserVo getUserVo(User user);

  List<UserVo> getUserVoList(List<User> userList);

  boolean userLogout(HttpServletRequest request);

  QueryWrapper getQueryWrapper(UserQueryRequest userQueryRequest);

  String getEncryptPassword(String userPassword);
}
