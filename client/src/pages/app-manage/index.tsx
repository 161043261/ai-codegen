import { Edit, Search, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserInfo from "@/components/user-info";
import {
  useDeleteAppByAdminMutation,
  useUpdateAppByAdminMutation,
} from "@/hooks/mutations/use-app-mutations";
import { useAdminAppVoByPage } from "@/hooks/queries/use-app-queries";
import type { AppVo } from "@/types";
import {
  CODE_GEN_TYPE_OPTIONS,
  formatCodegenType,
} from "@/utils/codegen-types";
import { formatTime } from "@/utils/time";

export default function AppManagePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    pageNum: 1,
    pageSize: 10,
    appName: "",
    userId: "",
    codegenType: "",
  });

  const queryParams = {
    pageNum: searchParams.pageNum,
    pageSize: searchParams.pageSize,
    appName: searchParams.appName || undefined,
    userId: searchParams.userId ? Number(searchParams.userId) : undefined,
    codegenType: searchParams.codegenType || undefined,
  };

  const { data: pageData } = useAdminAppVoByPage(queryParams);
  const data = pageData?.records ?? [];
  const total = pageData?.totalRow ?? 0;

  const updateAppByAdminMutation = useUpdateAppByAdminMutation();
  const deleteAppByAdminMutation = useDeleteAppByAdminMutation();

  const handleSearch = () => {
    setSearchParams((prev) => ({ ...prev, pageNum: 1 }));
  };

  const editApp = (app: AppVo) => {
    navigate(`/app/edit/${app.id}`);
  };

  const toggleAwesome = (app: AppVo) => {
    if (!app.id) return;
    const newPriority = app.priority === 99 ? 0 : 99;
    updateAppByAdminMutation.mutate(
      { id: app.id, priority: newPriority },
      {
        onSuccess: (res) => {
          if (res.code === 0) {
            toast.success(
              newPriority === 99 ? "Set as awesome" : "Removed from awesome",
            );
          } else {
            toast.error("Operation failed: " + res.message);
          }
        },
        onError: () => {
          toast.error("Operation failed");
        },
      },
    );
  };

  const deleteApp = (id: number | undefined) => {
    if (!id) return;
    deleteAppByAdminMutation.mutate(
      { id },
      {
        onSuccess: (res) => {
          if (res.code === 0) {
            toast.success("Deleted successfully");
          } else {
            toast.error("Delete failed: " + res.message);
          }
        },
        onError: () => {
          toast.error("Delete failed");
        },
      },
    );
  };

  return (
    <div className="mt-4 rounded-lg bg-white p-6">
      {/* Search Form */}
      <div className="mb-6 flex flex-wrap gap-4">
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
            value={searchParams.codegenType}
            onValueChange={(value) =>
              setSearchParams((prev) => ({ ...prev, codegenType: value }))
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
          <Search className="mr-2 h-4 w-4" />
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
                <TableCell className="max-w-37.5 truncate">
                  {app.appName}
                </TableCell>
                <TableCell>
                  {app.cover ? (
                    <img
                      src={app.cover}
                      alt={app.appName}
                      className="h-14 w-20 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-20 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                      No Cover
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block max-w-50 cursor-default truncate">
                          {app.initPrompt}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>{app.initPrompt}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{formatCodegenType(app.codegenType)}</TableCell>
                <TableCell>
                  {app.priority === 99 ? (
                    <Badge className="bg-yellow-500">Awesome</Badge>
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
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => editApp(app)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant={app.priority === 99 ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleAwesome(app)}
                    >
                      <Star className="mr-1 h-3 w-3" />
                      {app.priority === 99 ? "Not Awesome" : "Awesome"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the app.
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
  );
}
