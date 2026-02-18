import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib";
import type { UserVo } from "@/types";

interface Props {
  user?: UserVo;
  size?: "sm" | "default" | "lg";
  showName?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  default: "h-8 w-8",
  lg: "h-10 w-10",
};

export default function UserInfo({
  user,
  size = "default",
  showName = true,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={user?.userAvatar} />
        <AvatarFallback>{user?.userName?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm text-gray-800">
          {user?.userName || "Unknown User"}
        </span>
      )}
    </div>
  );
}
