import { createBrowserRouter, Navigate } from "react-router";
import BasicLayout from "@/layout";
import AppChatPage from "@/pages/app-chat";
import AppEditPage from "@/pages/app-edit";
import AppManagePage from "@/pages/app-manage";
import ChatManagePage from "@/pages/chat-manage";
import HomePage from "@/pages/homepage";
import UserLoginPage from "@/pages/user-login";
import UserManagePage from "@/pages/user-manage";
import UserRegisterPage from "@/pages/user-register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BasicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "user/login",
        element: <UserLoginPage />,
      },
      {
        path: "user/register",
        element: <UserRegisterPage />,
      },
      {
        path: "admin/userManage",
        element: <UserManagePage />,
      },
      {
        path: "admin/appManage",
        element: <AppManagePage />,
      },
      {
        path: "admin/chatManage",
        element: <ChatManagePage />,
      },
      {
        path: "app/chat/:id",
        element: <AppChatPage />,
      },
      {
        path: "app/edit/:id",
        element: <AppEditPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
