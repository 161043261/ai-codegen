export interface AppAdminUpdateRequest {
  id?: number;
  appName?: string;
  cover?: string;
  priority?: number;
}

export interface AppQueryRequest {
  pageNum?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  id?: number;
  appName?: string;
  cover?: string;
  initPrompt?: string;
  codegenType?: string;
  deployKey?: string;
  priority?: number;
  userId?: number;
}

export interface AppVo {
  id?: number;
  appName?: string;
  cover?: string;
  initPrompt?: string;
  codegenType?: string;
  deployKey?: string;
  deployedTime?: string;
  priority?: number;
  userId?: number;
  createTime?: string;
  updateTime?: string;
  user?: UserVo;
}

export interface BaseResponse<T> {
  code?: number;
  data?: T;
  message?: string;
}

export interface ChatHistory {
  id?: number;
  message?: string;
  messageType?: string;
  appId?: number;
  userId?: number;
  createTime?: string;
  updateTime?: string;
  isDelete?: number;
}

export interface ChatHistoryQueryRequest {
  pageNum?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  id?: number;
  message?: string;
  messageType?: string;
  appId?: number;
  userId?: number;
  lastCreateTime?: string;
}

export interface ListAppChatHistoryParams {
  appId: number;
  pageSize?: number;
  lastCreateTime?: string;
}

export interface LoginUserVo {
  id?: number;
  userAccount?: string;
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  userRole?: string;
  createTime?: string;
  updateTime?: string;
}

export interface PageAppVo {
  records?: AppVo[];
  pageNumber?: number;
  pageSize?: number;
  totalPage?: number;
  totalRow?: number;
  optimizeCountQuery?: boolean;
}

export interface PageChatHistory {
  records?: ChatHistory[];
  pageNumber?: number;
  pageSize?: number;
  totalPage?: number;
  totalRow?: number;
  optimizeCountQuery?: boolean;
}

export interface PageUserVo {
  records?: UserVo[];
  pageNumber?: number;
  pageSize?: number;
  totalPage?: number;
  totalRow?: number;
  optimizeCountQuery?: boolean;
}

export interface User {
  id?: number;
  userAccount?: string;
  userPassword?: string;
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  userRole?: string;
  editTime?: string;
  createTime?: string;
  updateTime?: string;
  isDelete?: number;
}

export interface UserAddRequest {
  userName?: string;
  userAccount?: string;
  userAvatar?: string;
  userProfile?: string;
  userRole?: string;
}

export interface UserQueryRequest {
  pageNum?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  id?: number;
  userName?: string;
  userAccount?: string;
  userProfile?: string;
  userRole?: string;
}

export interface UserRegisterRequest {
  userAccount?: string;
  userPassword?: string;
  checkPassword?: string;
}

export interface UserUpdateRequest {
  id?: number;
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  userRole?: string;
}

export interface UserVo {
  id?: number;
  userAccount?: string;
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  userRole?: string;
  createTime?: string;
}
