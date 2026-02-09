package com.github.tianchenghang.core.parser;

public interface CodeParser<T> {
  T parseCode(String codeContent);
}
