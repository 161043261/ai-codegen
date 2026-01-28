/**
 * 护栏验证结果
 */
export interface GuardrailResult {
  /** 是否通过验证 */
  success: boolean;
  /** 错误消息（验证失败时） */
  message?: string;
  /** 是否为致命错误（需要终止请求） */
  fatal?: boolean;
}

/**
 * 输入护栏接口
 */
export interface InputGuardrail {
  /**
   * 验证输入内容
   * @param input 用户输入
   * @returns 验证结果
   */
  validate(input: string): GuardrailResult;
}

/**
 * 输出护栏接口
 */
export interface OutputGuardrail {
  /**
   * 验证输出内容
   * @param output AI 输出
   * @returns 验证结果
   */
  validate(output: string): GuardrailResult;
}

/**
 * 创建成功结果
 */
export function success(): GuardrailResult {
  return { success: true };
}

/**
 * 创建失败结果
 */
export function fail(message: string): GuardrailResult {
  return { success: false, message };
}

/**
 * 创建致命错误结果
 */
export function fatal(message: string): GuardrailResult {
  return { success: false, message, fatal: true };
}
