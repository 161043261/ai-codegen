import { Edit, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import UserInfo from './UserInfo'
import { formatTime } from '@/utils/time'
import { formatCodeGenType } from '@/utils/codeGenTypes'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  app?: API.AppVO
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function AppDetailModal({
  open,
  onOpenChange,
  app,
  showActions = false,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>App Details</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-20 text-gray-500 text-sm shrink-0">Creator:</span>
              <UserInfo user={app?.user} size="sm" />
            </div>
            <div className="flex items-center">
              <span className="w-20 text-gray-500 text-sm shrink-0">Created:</span>
              <span className="text-sm">{formatTime(app?.createTime)}</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-gray-500 text-sm shrink-0">Type:</span>
              {app?.codeGenType ? (
                <Badge variant="secondary">{formatCodeGenType(app.codeGenType)}</Badge>
              ) : (
                <span className="text-sm text-gray-400">Unknown Type</span>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="pt-4 mt-4 border-t flex gap-3">
              <Button variant="default" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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
                    <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
