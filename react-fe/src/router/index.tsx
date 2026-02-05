import { createBrowserRouter, Navigate } from 'react-router'
import BasicLayout from '@/layouts/BasicLayout'
import HomePage from '@/pages/HomePage'
import UserLoginPage from '@/pages/user/UserLoginPage'
import UserRegisterPage from '@/pages/user/UserRegisterPage'
import UserManagePage from '@/pages/admin/UserManagePage'
import AppManagePage from '@/pages/admin/AppManagePage'
import ChatManagePage from '@/pages/admin/ChatManagePage'
import AppChatPage from '@/pages/app/AppChatPage'
import AppEditPage from '@/pages/app/AppEditPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'user/login',
        element: <UserLoginPage />,
      },
      {
        path: 'user/register',
        element: <UserRegisterPage />,
      },
      {
        path: 'admin/userManage',
        element: <UserManagePage />,
      },
      {
        path: 'admin/appManage',
        element: <AppManagePage />,
      },
      {
        path: 'admin/chatManage',
        element: <ChatManagePage />,
      },
      {
        path: 'app/chat/:id',
        element: <AppChatPage />,
      },
      {
        path: 'app/edit/:id',
        element: <AppEditPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

export default router
