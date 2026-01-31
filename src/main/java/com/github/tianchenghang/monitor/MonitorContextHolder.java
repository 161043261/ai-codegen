package com.github.tianchenghang.monitor;

public class MonitorContextHolder {
  private static final ThreadLocal<MonitorContext> CONTEXT_HOLDER = new ThreadLocal<>();

  public static void setContext(MonitorContext context) {
    CONTEXT_HOLDER.set(context);
  }

  public static MonitorContext getContext() {
    return CONTEXT_HOLDER.get();
  }

  public static void clearContext() {
    CONTEXT_HOLDER.remove();
  }
}
