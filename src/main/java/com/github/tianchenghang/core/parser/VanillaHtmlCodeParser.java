package com.github.tianchenghang.core.parser;

import com.github.tianchenghang.ai.model.VanillaHtmlResult;
import java.util.regex.Pattern;

public class VanillaHtmlCodeParser implements CodeParser<VanillaHtmlResult> {
  private static final Pattern HTML_CODE_PATTERN =
      Pattern.compile("```html\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

  @Override
  public VanillaHtmlResult parseCode(String codeContent) {
    var result = new VanillaHtmlResult();
    var htmlCode = extractHtmlCode(codeContent);
    if (htmlCode != null && !htmlCode.trim().isEmpty()) {
      result.setHtmlCode(htmlCode);
    } else {
      result.setHtmlCode(codeContent.trim());
    }
    return result;
  }

  private String extractHtmlCode(String content) {
    var matcher = HTML_CODE_PATTERN.matcher(content);
    if (matcher.find()) {
      return matcher.group(1);
    }
    return null;
  }
}
