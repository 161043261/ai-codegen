package com.github.tianchenghang.core.parser;

import com.github.tianchenghang.ai.model.MultiFilesResult;
import java.util.regex.Pattern;

public class MultiFilesCodeParser implements CodeParser<MultiFilesResult> {
  private static final Pattern HTML_CODE_PATTERN =
      Pattern.compile("```html\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
  private static final Pattern CSS_CODE_PATTERN =
      Pattern.compile("```css\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
  private static final Pattern JS_CODE_PATTERN =
      Pattern.compile("```(?:js|javascript)\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

  @Override
  public MultiFilesResult parseCode(String content) {
    var result = new MultiFilesResult();
    String htmlCode = extractCodeByPattern(content, HTML_CODE_PATTERN);
    String cssCode = extractCodeByPattern(content, CSS_CODE_PATTERN);
    String jsCode = extractCodeByPattern(content, JS_CODE_PATTERN);
    if (htmlCode != null && !htmlCode.trim().isEmpty()) {
      result.setHtmlCode(htmlCode.trim());
    }
    if (cssCode != null && !cssCode.trim().isEmpty()) {
      result.setCssCode(cssCode.trim());
    }
    if (jsCode != null && !jsCode.trim().isEmpty()) {
      result.setJsCode(jsCode.trim());
    }
    return result;
  }

  private String extractCodeByPattern(String content, Pattern pattern) {
    var matcher = pattern.matcher(content);
    if (matcher.find()) {
      return matcher.group(1);
    }
    return null;
  }
}
