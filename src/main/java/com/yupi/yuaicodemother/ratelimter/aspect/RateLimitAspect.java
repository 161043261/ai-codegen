package com.yupi.yuaicodemother.ratelimter.aspect;

import com.yupi.yuaicodemother.exception.BusinessException;
import com.yupi.yuaicodemother.exception.ErrorCode;
import com.yupi.yuaicodemother.model.entity.User;
import com.yupi.yuaicodemother.ratelimter.annotation.RateLimit;
import com.yupi.yuaicodemother.ratelimter.limiter.RateLimiter;
import com.yupi.yuaicodemother.service.UserService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** 限流切面核心逻辑 */
@Aspect
@Component
@Slf4j
public class RateLimitAspect {

  @Resource private RateLimiter rateLimiter;

  @Resource private UserService userService;

  @Before("@annotation(rateLimit)")
  public void doBefore(JoinPoint point, RateLimit rateLimit) {
    String key = generateRateLimitKey(point, rateLimit);
    // 使用限流器（支持 Redis 分布式限流和本地限流）
    if (!rateLimiter.tryAcquire(key, rateLimit.rate(), rateLimit.rateInterval())) {
      throw new BusinessException(ErrorCode.TOO_MANY_REQUEST, rateLimit.message());
    }
  }

  /**
   * 生成限流key
   *
   * @param point
   * @param rateLimit
   * @return
   */
  private String generateRateLimitKey(JoinPoint point, RateLimit rateLimit) {
    StringBuilder keyBuilder = new StringBuilder();
    keyBuilder.append("rate_limit:");
    // 添加自定义前缀
    if (!rateLimit.key().isEmpty()) {
      keyBuilder.append(rateLimit.key()).append(":");
    }
    // 根据限流类型生成不同的key
    switch (rateLimit.limitType()) {
      case API:
        // 接口级别：方法名
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        keyBuilder
            .append("api:")
            .append(method.getDeclaringClass().getSimpleName())
            .append(".")
            .append(method.getName());
        break;
      case USER:
        // 用户级别：用户ID
        try {
          ServletRequestAttributes attributes =
              (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
          if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            User loginUser = userService.getLoginUser(request);
            keyBuilder.append("user:").append(loginUser.getId());
          } else {
            // 无法获取请求上下文，使用IP限流
            keyBuilder.append("ip:").append(getClientIP());
          }
        } catch (BusinessException e) {
          // 未登录用户使用IP限流
          keyBuilder.append("ip:").append(getClientIP());
        }
        break;
      case IP:
        // IP级别：客户端IP
        keyBuilder.append("ip:").append(getClientIP());
        break;
      default:
        throw new BusinessException(ErrorCode.SYSTEM_ERROR, "不支持的限流类型");
    }
    return keyBuilder.toString();
  }

  /**
   * 获取客户端IP
   *
   * @return
   */
  private String getClientIP() {
    ServletRequestAttributes attributes =
        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attributes == null) {
      return "unknown";
    }
    HttpServletRequest request = attributes.getRequest();
    String ip = request.getHeader("X-Forwarded-For");
    if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
      ip = request.getHeader("X-Real-IP");
    }
    if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
      ip = request.getRemoteAddr();
    }
    // 处理多级代理的情况
    if (ip != null && ip.contains(",")) {
      ip = ip.split(",")[0].trim();
    }
    return ip != null ? ip : "unknown";
  }
}
