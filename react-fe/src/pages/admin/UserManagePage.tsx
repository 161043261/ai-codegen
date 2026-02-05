import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteUser, listUserVoByPage } from '@/api/userController'

export default function UserManagePage() {
  const [data, setData] = useState<API.UserVO[]>([])
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useState({
    pageNum: 1,
    pageSize: 10,
    userAccount: '',
    userName: '',
  })

  const fetchData = async () => {
    try {
      const res = await listUserVoByPage(searchParams)
      if (res.data.data) {
        setData(res.data.data.records ?? [])
        setTotal(res.data.data.totalRow ?? 0)
      } else {
        toast.error('Failed to fetch data: ' + res.data.message)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to fetch data')
    }
  }

  useEffect(() => {
    fetchData()
  }, [searchParams.pageNum, searchParams.pageSize])

  const handleSearch = () => {
    setSearchParams((prev) => ({ ...prev, pageNum: 1 }))
    fetchData()
  }

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    try {
      const res = await deleteUser({ id })
      if (res.data.code === 0) {
        toast.success('Deleted successfully')
        fetchData()
      } else {
        toast.error('Delete failed')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Delete failed')
    }
  }

  return (
    <div className="p-6 bg-white mt-4 rounded-lg">
      {/* Search Form */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Account:</span>
          <Input
            placeholder="Enter account"
            value={searchParams.userAccount}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, userAccount: e.target.value }))
            }
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Username:</span>
          <Input
            placeholder="Enter username"
            value={searchParams.userName}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, userName: e.target.value }))
            }
            className="w-40"
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Avatar</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.userAccount}</TableCell>
              <TableCell>{user.userName}</TableCell>
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.userAvatar} />
                  <AvatarFallback>{user.userName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{user.userProfile}</TableCell>
              <TableCell>
                {user.userRole === 'admin' ? (
                  <Badge variant="default" className="bg-green-500">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </TableCell>
              <TableCell>
                {user.createTime && dayjs(user.createTime).format('YYYY-MM-DD HH:mm:ss')}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(user.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Info */}
      <div className="mt-4 text-sm text-gray-500">Total: {total} users</div>
    </div>
  )
}
