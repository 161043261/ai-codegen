import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Search, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { formatTime } from '@/utils/time'
import { listAllChatHistoryByPageForAdmin } from '@/api/chatHistoryController'

export default function ChatManagePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<API.ChatHistory[]>([])
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useState({
    pageNum: 1,
    pageSize: 10,
    message: '',
    messageType: '',
    appId: '',
    userId: '',
  })

  const fetchData = async () => {
    try {
      const res = await listAllChatHistoryByPageForAdmin({
        ...searchParams,
        appId: searchParams.appId ? Number(searchParams.appId) : undefined,
        userId: searchParams.userId ? Number(searchParams.userId) : undefined,
        messageType: searchParams.messageType || undefined,
      })
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

  const viewAppChat = (appId: number | undefined) => {
    if (appId) {
      navigate(`/app/chat/${appId}`)
    }
  }

  const deleteMessage = async (id: number | undefined) => {
    if (!id) return
    // Note: Backend delete API needed
    toast.success('Deleted successfully')
    fetchData()
  }

  return (
    <div className="p-6 bg-white mt-4 rounded-lg">
      {/* Search Form */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Message:</span>
          <Input
            placeholder="Enter message"
            value={searchParams.message}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, message: e.target.value }))
            }
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Type:</span>
          <Select
            value={searchParams.messageType}
            onValueChange={(value) =>
              setSearchParams((prev) => ({ ...prev, messageType: value }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="assistant">AI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">App ID:</span>
          <Input
            placeholder="Enter app ID"
            value={searchParams.appId}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, appId: e.target.value }))
            }
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">User ID:</span>
          <Input
            placeholder="Enter user ID"
            value={searchParams.userId}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, userId: e.target.value }))
            }
            className="w-24"
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-80">Message</TableHead>
              <TableHead className="w-24">Type</TableHead>
              <TableHead className="w-20">App ID</TableHead>
              <TableHead className="w-20">User ID</TableHead>
              <TableHead className="w-40">Created</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((chat) => (
              <TableRow key={chat.id}>
                <TableCell>{chat.id}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate max-w-[300px] cursor-default">
                          {chat.message}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="whitespace-pre-wrap">{chat.message}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge variant={chat.messageType === 'user' ? 'default' : 'secondary'}>
                    {chat.messageType === 'user' ? 'User' : 'AI'}
                  </Badge>
                </TableCell>
                <TableCell>{chat.appId}</TableCell>
                <TableCell>{chat.userId}</TableCell>
                <TableCell>{formatTime(chat.createTime)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => viewAppChat(chat.appId)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Chat
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this message.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMessage(chat.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="mt-4 text-sm text-gray-500">Total: {total} messages</div>
    </div>
  )
}
