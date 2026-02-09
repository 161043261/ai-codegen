package com.github.tianchenghang.core;

import com.github.tianchenghang.ai.model.MultiFilesResult;
import com.github.tianchenghang.ai.model.VanillaHtmlResult;
import java.util.regex.Pattern;

public class CodeParser {
  private static final Pattern HTML_CODE_PATTERN =
      Pattern.compile("```html\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
  private static final Pattern CSS_CODE_PATTERN =
      Pattern.compile("```css\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
  private static final Pattern JS_CODE_PATTERN =
      Pattern.compile("```(?:js|javascript)\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

  public static VanillaHtmlResult parseHtmlCode(String codeContent) {
    var result = new VanillaHtmlResult();
    var htmlCode = extractHtmlCode(codeContent);
    if (htmlCode != null && !htmlCode.trim().isEmpty()) {
      result.setHtmlCode(htmlCode);
    } else {
      result.setHtmlCode(codeContent.trim());
    }
    return result;
  }

  public static MultiFilesResult parseMultiFiles(String codeContent) {
    var result = new MultiFilesResult();
    var htmlCode = extractCodeByPattern(codeContent, HTML_CODE_PATTERN);
    var cssCode = extractCodeByPattern(codeContent, CSS_CODE_PATTERN);
    var jsCode = extractCodeByPattern(codeContent, JS_CODE_PATTERN);
    if (htmlCode != null && !htmlCode.trim().isEmpty()) {
      result.setHtmlCode(htmlCode);
    }
    if (cssCode != null && !cssCode.trim().isEmpty()) {
      result.setCssCode(cssCode);
    }
    if (jsCode != null && !jsCode.trim().isEmpty()) {
      result.setJsCode(jsCode);
    }
    return result;
  }

  private static String extractHtmlCode(String content) {
    var matcher = HTML_CODE_PATTERN.matcher(content);
    if (matcher.find()) {
      return matcher.group(1);
    }
    return null;
  }

  private static String extractCodeByPattern(String content, Pattern pattern) {
    var matcher = pattern.matcher(content);
    if (matcher.find()) {
      return matcher.group(1);
    }
    return null;
  }
}
