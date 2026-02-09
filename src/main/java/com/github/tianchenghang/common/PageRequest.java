package com.github.tianchenghang.common;

import lombok.Data;

@Data
public class PageRequest {

  public static class SortOrder {
    public static final String ASC = "ASC";
    public static final String DESC = "DESC";
  }

  private int pageNum = 1;

  private int pageSize = 10;

  private String sortField;

  private String sortOrder = SortOrder.ASC; // ASC
}
