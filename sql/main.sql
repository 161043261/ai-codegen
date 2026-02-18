-- docker exec -i mysql mysql -uroot -ppass < ./sql/main.sql
drop database if exists ai_codegen;

create database if not exists ai_codegen;

use ai_codegen;

create table if not exists user
(
  id            bigint auto_increment comment 'id' primary key,
  user_account  varchar(256)                           not null comment 'user account',
  user_password varchar(512)                           not null comment 'password',
  username      varchar(256)                           null comment 'username',
  user_avatar   varchar(1024)                          null comment 'user avatar',
  user_profile  varchar(512)                           null comment 'user profile',
  user_role     varchar(256) default 'user'            not null comment 'user role',
  edit_time     datetime     default CURRENT_TIMESTAMP not null comment 'edit time',
  create_time   datetime     default CURRENT_TIMESTAMP not null comment 'create time',
  update_time   datetime     default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment 'update time',
  is_delete     tinyint      default 0                 not null comment 'is delete, default 0, 1 as deleted',
  UNIQUE KEY uk_user_account (user_account),
  INDEX idx_username (username)
) comment 'user' collate = utf8mb4_unicode_ci;

create table if not exists app
(
  id           bigint auto_increment comment 'id' primary key,
  app_name     varchar(256)                       null comment 'app name',
  app_cover    varchar(512)                       null comment 'app cover',
  init_prompt  text                               null comment 'init prompt',
  codegen_type varchar(64)                        null comment 'codegen type',
  deploy_key   varchar(64)                        null comment 'deploy key',
  deploy_time  varchar(64)                        null comment 'deploy time',
  priority     int      default 0                 not null comment 'priority',
  user_id      bigint                             not null comment 'creator user id',
  edit_time    datetime default CURRENT_TIMESTAMP not null comment 'edit time',
  create_time  datetime default CURRENT_TIMESTAMP not null comment 'create time',
  update_time  datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment 'update time',
  is_delete    tinyint  default 0                 not null comment 'is delete, default 0, 1 as deleted',
  UNIQUE KEY uk_deploy_key (deploy_key),
  INDEX idx_app_name (app_name),
  INDEX idx_user_id (user_id)
) comment 'app' collate = utf8mb4_unicode_ci;

create table if not exists chat_history
(
  id           bigint auto_increment comment 'id' primary key,
  message      text                               not null comment 'message',
  message_type varchar(32)                        not null comment 'user or ai',
  app_id       bigint                             not null comment 'app id',
  user_id      bigint                             not null comment 'creator user id',
  create_time  datetime default CURRENT_TIMESTAMP not null comment 'create time',
  update_time  datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment 'update time',
  is_delete    tinyint  default 0                 not null comment 'is delete, default 0, 1 as deleted',
  INDEX idx_app_id (app_id),
  INDEX idx_create_time (create_time),
  INDEX idx_app_id_create_time (app_id, create_time)
) comment 'chat history' collate = utf8mb4_unicode_ci;
