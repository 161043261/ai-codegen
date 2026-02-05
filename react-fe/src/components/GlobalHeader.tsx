import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Home, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/stores/userStore'
import { userLogout } from '@/api/userController'

interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  href?: string
}

const menuItems: MenuItem[] = [
  { key: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { key: '/admin/userManage', label: 'User Management' },
  { key: '/admin/appManage', label: 'App Management' },
]

export default function GlobalHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loginUser, setLoginUser } = useUserStore()
  const [selectedKey, setSelectedKey] = useState('/')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setSelectedKey(location.pathname)
  }, [location.pathname])

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.key.startsWith('/admin')) {
      return loginUser?.userRole === 'admin'
    }
    return true
  })

  const handleLogout = async () => {
    const res = await userLogout()
    if (res.data.code === 0) {
      setLoginUser({ userName: 'Not logged in' })
      toast.success('Logged out successfully')
      navigate('/user/login')
    } else {
      toast.error('Logout failed: ' + res.data.message)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Title */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img src="/logo.png" alt="Logo" className="h-10 w-10" />
          <h1 className="text-lg font-semibold text-blue-500 hidden sm:block">
            AI App Generator
          </h1>
        </Link>

        {/* Center: Navigation Menu (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.key}
              to={item.key}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors no-underline ${
                selectedKey === item.key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}
          <a
            href="https://www.codefather.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 no-underline"
          >
            CodeFather
          </a>
        </nav>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3">
          {loginUser?.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={loginUser.userAvatar} />
                    <AvatarFallback>
                      {loginUser.userName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">
                    {loginUser.userName || 'Anonymous'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/user/login">Login</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 pb-2 border-t pt-4">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.key}
              to={item.key}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-md text-sm font-medium no-underline ${
                selectedKey === item.key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
