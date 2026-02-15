declare namespace ApiNs {
  interface AppAddRequest {
    initPrompt?: string;
  }

  interface AppAdminUpdateRequest {
    id?: number;
    appName?: string;
    cover?: string;
    priority?: number;
  }

  interface AppDeployRequest {
    appId?: number;
  }

  interface AppQueryRequest {
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

  interface AppUpdateRequest {
    id?: number;
    appName?: string;
  }

  interface AppVo {
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

  interface BaseResponseAppVo {
    code?: number;
    data?: AppVo;
    message?: string;
  }

  interface BaseResponseBoolean {
    code?: number;
    data?: boolean;
    message?: string;
  }

  interface BaseResponseLoginUserVo {
    code?: number;
    data?: LoginUserVo;
    message?: string;
  }

  interface BaseResponseNumber {
    code?: number;
    data?: number;
    message?: string;
  }

  interface BaseResponsePageAppVo {
    code?: number;
    data?: PageAppVo;
    message?: string;
  }

  interface BaseResponsePageChatHistory {
    code?: number;
    data?: PageChatHistory;
    message?: string;
  }

  interface BaseResponsePageUserVo {
    code?: number;
    data?: PageUserVo;
    message?: string;
  }

  interface BaseResponseString {
    code?: number;
    data?: string;
    message?: string;
  }

  interface BaseResponseUser {
    code?: number;
    data?: User;
    message?: string;
  }

  interface BaseResponseUserVo {
    code?: number;
    data?: UserVo;
    message?: string;
  }

  interface ChatHistory {
    id?: number;
    message?: string;
    messageType?: string;
    appId?: number;
    userId?: number;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  }

  interface ChatHistoryQueryRequest {
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

  interface ChatToGenCodeParams {
    appId: number;
    message: string;
  }

  interface DeleteRequest {
    id?: number;
  }

  interface DownloadAppCodeParams {
    appId: number;
  }

  interface GetAppVoByIdByAdminParams {
    id: number;
  }

  interface GetAppVoByIdParams {
    id: number;
  }

  interface GetUserByIdParams {
    id: number;
  }

  interface GetUserVoByIdParams {
    id: number;
  }

  interface ListAppChatHistoryParams {
    appId: number;
    pageSize?: number;
    lastCreateTime?: string;
  }

  interface LoginUserVo {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
    updateTime?: string;
  }

  interface PageAppVo {
    records?: AppVo[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface PageChatHistory {
    records?: ChatHistory[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface PageUserVo {
    records?: UserVo[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  type ServerSentEventString = true;

  interface ServeStaticResourceParams {
    deployKey: string;
  }

  interface User {
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

  interface UserAddRequest {
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  }

  interface UserLoginRequest {
    userAccount?: string;
    userPassword?: string;
  }

  interface UserQueryRequest {
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

  interface UserRegisterRequest {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
  }

  interface UserUpdateRequest {
    id?: number;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  }

  interface UserVo {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
  }
}
