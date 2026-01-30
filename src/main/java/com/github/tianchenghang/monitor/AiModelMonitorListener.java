package com.github.tianchenghang.monitor;

import jakarta.annotation.Resource;

public class AiModelMonitorListener {
  private static final String REQUEST_START_TIME_KEY = "request-start-time";
  private static final String MONITOR_CONTEXT_KEY = "monitor-context";

  @Resource
  private AiModelMetricsCollector aiModelMetricsCollector;
}
