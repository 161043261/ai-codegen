package com.github.tianchenghang.ai.guardrail;

import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.guardrail.InputGuardrail;
import dev.langchain4j.guardrail.InputGuardrailResult;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class PromptSafeInputGuardrail implements InputGuardrail {
  private static final List<String> SENSITIVE_WORDS =
      Arrays.asList(
          "ignore above",
          "ignore previous",
          "bypass",
          "hack",
          "jailbreak",
          "忽略以上指令",
          "忽略之前指令",
          "绕过",
          "破解",
          "越狱");

  private static final List<Pattern> INJECTION_PATTERNS =
      Arrays.asList(

          // \s+ 匹配一个或多个
          // (?:previous|above|all) 匹配任一单词
          // (?:previous|above|all) 匹配任一单词
          // i 忽略大小写

          // /ignore\s+(?:above|all|previous)\s+(?:commands?|instructions?|prompts?)/i,
          // /(?:disregard|forget)\s+(?:all|everything)\s+(?:above|before)/i,
          // /(?:act|behave|pretend)\s+(?:as|like)\s+(?:if|you\s+are)/i,
          // /system\s*:\s*you\s+are/i,
          // /new\s+(?:commands?|instructions?|prompts?)\s*:/i,

          Pattern.compile(
              "(?i)ignore\\s+(?:above|all|previous)\\s+(?:commands?|instructions?|prompts?)"),
          Pattern.compile("(?i)(?:disregard|forget)\\s+(?:all|everything)\\s+(?:above|before)"),
          Pattern.compile("(?i)(?:act|behave|pretend)\\s+(?:as|like)\\s+(?:if|you\\s+are)"),
          Pattern.compile("(?i)system\\s*:\\s*you\\s+are"),
          Pattern.compile("(?i)new\\s+(?:commands?|instructions?|prompts?)\\s*:"),
          Pattern.compile("(?i)\\{\\{.*\\}\\}"), // 模板注入
          Pattern.compile("(?i)<\\|.*\\|>") // 特殊标记注入
          );

  @Override
  public InputGuardrailResult validate(UserMessage userMessage) {
    var input = userMessage.singleText();
    if (input.length() > 1000) {
      return fatal("输入内容超过 1000 字符");
    }
    if (input.trim().isEmpty()) {
      return fatal("输入内容为空");
    }
    var lowerInput = input.toLowerCase();
    for (var sensitiveWord : SENSITIVE_WORDS) {
      if (lowerInput.contains(sensitiveWord.toLowerCase())) {
        return fatal("输入内容包含敏感词");
      }
    }
    for (var pattern : INJECTION_PATTERNS) {
      if (pattern.matcher(input).find()) {
        return fatal("检测到非法输入");
      }
    }
    return success();
  }
}
