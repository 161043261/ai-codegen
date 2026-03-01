import { Edit, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppVo } from "@/types";
import { formatCodegenType } from "@/utils/codegen-types";
import { formatTime } from "@/utils/time";
import UserInfo from "../user-info";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app?: AppVo;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
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
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>App Details</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-20 shrink-0 text-sm text-gray-500">
                Creator:
              </span>
              <UserInfo user={app?.user} size="sm" />
            </div>
            <div className="flex items-center">
              <span className="w-20 shrink-0 text-sm text-gray-500">
                Created:
              </span>
              <span className="text-sm">{formatTime(app?.createTime)}</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 shrink-0 text-sm text-gray-500">Type:</span>
              {app?.codegenType ? (
                <Badge variant="secondary">
                  {formatCodegenType(app.codegenType)}
                </Badge>
              ) : (
                <span className="text-sm text-gray-400">Unknown Type</span>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="mt-4 flex gap-3 border-t pt-4">
              <Button variant="default" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the app.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
