import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Search, Edit, Star, Trash2 } from 'lucide-react'
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
import UserInfo from '@/components/UserInfo'
import { formatTime } from '@/utils/time'
import { formatCodeGenType, CODE_GEN_TYPE_OPTIONS } from '@/utils/codeGenTypes'
import {
  listAppVoByPageByAdmin,
  deleteAppByAdmin,
  updateAppByAdmin,
} from '@/api/appController'

export default function AppManagePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<API.AppVO[]>([])
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useState({
    pageNum: 1,
    pageSize: 10,
    appName: '',
    userId: '',
    codeGenType: '',
  })

  const fetchData = async () => {
    try {
      const res = await listAppVoByPageByAdmin({
        ...searchParams,
        userId: searchParams.userId ? Number(searchParams.userId) : undefined,
        codeGenType: searchParams.codeGenType || undefined,
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

  const editApp = (app: API.AppVO) => {
    navigate(`/app/edit/${app.id}`)
  }

  const toggleFeatured = async (app: API.AppVO) => {
    if (!app.id) return
    const newPriority = app.priority === 99 ? 0 : 99
    try {
      const res = await updateAppByAdmin({ id: app.id, priority: newPriority })
      if (res.data.code === 0) {
        toast.success(newPriority === 99 ? 'Set as featured' : 'Removed from featured')
        fetchData()
      } else {
        toast.error('Operation failed: ' + res.data.message)
      }
    } catch (error) {
      console.error('Operation failed:', error)
      toast.error('Operation failed')
    }
  }

  const deleteApp = async (id: number | undefined) => {
    if (!id) return
    try {
      const res = await deleteAppByAdmin({ id })
      if (res.data.code === 0) {
        toast.success('Deleted successfully')
        fetchData()
      } else {
        toast.error('Delete failed: ' + res.data.message)
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
          <span className="text-sm text-gray-600">App Name:</span>
          <Input
            placeholder="Enter app name"
            value={searchParams.appName}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, appName: e.target.value }))
            }
            className="w-40"
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
            className="w-32"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Gen Type:</span>
          <Select
            value={searchParams.codeGenType}
            onValueChange={(value) =>
              setSearchParams((prev) => ({ ...prev, codeGenType: value }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CODE_GEN_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <TableHead className="w-36">App Name</TableHead>
              <TableHead className="w-24">Cover</TableHead>
              <TableHead className="w-48">Init Prompt</TableHead>
              <TableHead className="w-28">Gen Type</TableHead>
              <TableHead className="w-20">Priority</TableHead>
              <TableHead className="w-36">Deployed</TableHead>
              <TableHead className="w-28">Creator</TableHead>
              <TableHead className="w-36">Created</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.id}</TableCell>
                <TableCell className="truncate max-w-[150px]">{app.appName}</TableCell>
                <TableCell>
                  {app.cover ? (
                    <img
                      src={app.cover}
                      alt={app.appName}
                      className="w-20 h-14 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-14 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      No Cover
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate max-w-[200px] cursor-default">
                          {app.initPrompt}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>{app.initPrompt}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{formatCodeGenType(app.codeGenType)}</TableCell>
                <TableCell>
                  {app.priority === 99 ? (
                    <Badge className="bg-yellow-500">Featured</Badge>
                  ) : (
                    <span>{app.priority || 0}</span>
                  )}
                </TableCell>
                <TableCell>
                  {app.deployedTime ? (
                    formatTime(app.deployedTime)
                  ) : (
                    <span className="text-gray-400">Not deployed</span>
                  )}
                </TableCell>
                <TableCell>
                  <UserInfo user={app.user} size="sm" />
                </TableCell>
                <TableCell>{formatTime(app.createTime)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => editApp(app)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={app.priority === 99 ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => toggleFeatured(app)}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {app.priority === 99 ? 'Unfeature' : 'Feature'}
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
                            This action cannot be undone. This will permanently delete the app.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteApp(app.id)}>
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
      <div className="mt-4 text-sm text-gray-500">Total: {total} apps</div>
    </div>
  )
}
