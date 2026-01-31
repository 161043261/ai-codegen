package com.github.tianchenghang.aop;

import com.github.tianchenghang.annotation.AuthCheck;
import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.model.enums.UserRole;
import com.github.tianchenghang.service.UserService;
import jakarta.annotation.Resource;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuthInterceptor {
  @Resource private UserService userService;

  @Around("@annotation(authCheck)")
  public Object doInterceptor(ProceedingJoinPoint joinPoint, AuthCheck authCheck) throws Throwable {
    var mustRole = authCheck.mustRole();
    var requestAttributes = RequestContextHolder.getRequestAttributes();
    if (requestAttributes == null) {
      return joinPoint.proceed();
    }
    var request = ((ServletRequestAttributes) requestAttributes).getRequest();
    var loginUser = userService.getLoginUser(request);
    var mustRoleEnum = UserRole.getEnumByValue(mustRole);
    if (mustRoleEnum == null) {
      return joinPoint.proceed();
    }
    var userRoleEnum = UserRole.getEnumByValue(loginUser.getUserRole());
    if (userRoleEnum == null
        || (UserRole.ADMIN.equals(mustRoleEnum) && !UserRole.ADMIN.equals(userRoleEnum))) {
      throw new BusinessException(ErrorCode.NO_PERMISSION);
    }
    return joinPoint.proceed();
  }
}
