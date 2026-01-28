/**
 * 监控上下文
 * 用于在请求生命周期内传递监控相关信息
 */
export interface MonitorContext {
  /** 用户 ID */
  userId?: string;
  /** 应用 ID */
  appId?: string;
  /** 请求开始时间 */
  startTime?: number;
  /** 模型名称 */
  modelName?: string;
  /** 自定义标签 */
  labels?: Record<string, string>;
}

/**
 * 监控上下文持有者
 * 使用 AsyncLocalStorage 实现请求上下文传递
 */
import { AsyncLocalStorage } from "async_hooks";

class MonitorContextHolder {
  private static storage = new AsyncLocalStorage<MonitorContext>();

  /**
   * 设置当前上下文
   */
  static setContext(context: MonitorContext): void {
    const current = this.getContext();
    this.storage.enterWith({ ...current, ...context });
  }

  /**
   * 获取当前上下文
   */
  static getContext(): MonitorContext {
    return this.storage.getStore() || {};
  }

  /**
   * 在上下文中运行回调
   */
  static run<T>(context: MonitorContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  /**
   * 清除上下文
   */
  static clear(): void {
    this.storage.enterWith({});
  }
}

export { MonitorContextHolder };
