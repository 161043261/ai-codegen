package com.github.tianchenghang.rate_limiter.aspect;

import com.github.tianchenghang.exception.BusinessException;
import com.github.tianchenghang.exception.ErrorCode;
import com.github.tianchenghang.rate_limiter.annotation.RateLimit;
import com.github.tianchenghang.rate_limiter.limiter.RateLimiter;
import com.github.tianchenghang.service.UserService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@Slf4j
public class RateLimitAspect {

  @Resource private RateLimiter rateLimiter;

  @Resource private UserService userService;

  @Before("@annotation(rateLimit)")
  public void doBefore(JoinPoint joinPoint, RateLimit rateLimit) {
    var key = generateRateLimitKey(joinPoint, rateLimit);
  }

  private String generateRateLimitKey(JoinPoint joinPoint, RateLimit rateLimit) {
    var keyBuilder = new StringBuilder();
    keyBuilder.append("rate_limit:");
    if (!rateLimit.key().isEmpty()) {
      keyBuilder.append(rateLimit.key()).append(":");
    }

    switch (rateLimit.limitType()) {
      // 接口级别限流
      case API:
        {
          var signature = (MethodSignature) joinPoint.getSignature();
          var method = signature.getMethod();
          keyBuilder
              .append("api:")
              .append(method.getDeclaringClass().getSimpleName())
              .append(".")
              .append(method.getName());
          break;
        }

      // 用户级别限流
      case USER:
        {
          try {
            var attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
              var request = attributes.getRequest();
              var loginUser = userService.getLoginUser(request);
              keyBuilder.append("user:").append(loginUser.getId());
            } else {
              keyBuilder.append("ip:").append(getClientIp());
            }
          } catch (BusinessException e) {
            keyBuilder.append("ip:").append(getClientIp());
          }
          break;
        }

      // IP 级别限流
      case IP:
        {
          keyBuilder.append("ip:").append(getClientIp());
          break;
        }

      default:
        {
          throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "不支持的限流类型");
        }
    }
    return keyBuilder.toString();
  }

  private String getClientIp() {
    var attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attributes == null) {
      return "unknown";
    }
    var request = attributes.getRequest();
    var ip = request.getHeader("X-Forwarded-For");
    if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
      ip = request.getHeader("X-Real-IP");
    }
    if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
      ip = request.getRemoteAddr();
    }
    if (ip != null && ip.contains(",")) {
      ip = ip.split(",")[0].trim();
    }
    return ip != null ? ip : "unknown";
  }
}
