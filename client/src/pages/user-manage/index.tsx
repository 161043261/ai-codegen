import dayjs from "dayjs";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteUserMutation } from "@/hooks/mutations/use-user-mutations";
import { useUserVoByPage } from "@/hooks/queries/use-user-queries";

export default function UserManagePage() {
  const [searchParams, setSearchParams] = useState({
    pageNum: 1,
    pageSize: 10,
    userAccount: "",
    userName: "",
  });

  const { data: pageData } = useUserVoByPage(searchParams);
  const data = pageData?.records ?? [];
  const total = pageData?.totalRow ?? 0;

  const deleteUserMutation = useDeleteUserMutation();

  const handleSearch = () => {
    setSearchParams((prev) => ({ ...prev, pageNum: 1 }));
  };

  const handleDelete = (id: number | undefined) => {
    if (!id) return;
    deleteUserMutation.mutate(
      { id },
      {
        onSuccess: (res) => {
          if (res.code === 0) {
            toast.success("Deleted successfully");
          } else {
            toast.error("Delete failed");
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
          <span className="text-sm text-gray-600">Account:</span>
          <Input
            placeholder="Enter account"
            value={searchParams.userAccount}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                userAccount: e.target.value,
              }))
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
          <Search className="mr-2 h-4 w-4" />
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
                  <AvatarFallback>
                    {user.userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="max-w-50 truncate">
                {user.userProfile}
              </TableCell>
              <TableCell>
                {user.userRole === "admin" ? (
                  <Badge variant="default" className="bg-green-500">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </TableCell>
              <TableCell>
                {user.createTime &&
                  dayjs(user.createTime).format("YYYY-MM-DD HH:mm:ss")}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the user.
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
  );
}
