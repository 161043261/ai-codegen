package com.github.tianchenghang.common;

import lombok.Data;

@Data
public class PageRequest {

  static enum SortOrder {
    ascend,
    descend
  }

  private int pageNum = 1;

  private int pageSize = 10;

  private String sortField;

  private String sortOrder = SortOrder.descend.name(); // ascend
}
