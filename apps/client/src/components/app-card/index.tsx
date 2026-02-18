import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AppVo } from "@/types";

interface Props {
  app: AppVo;
  awesome?: boolean;
  onViewChat?: (appId: string | number | undefined) => void;
  onViewWork?: (app: AppVo) => void;
}

export default function AppCard({
  app,
  awesome = false,
  onViewChat,
  onViewWork,
}: Props) {
  return (
    <div
      className={`cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
        awesome ? "ring-2 ring-yellow-400" : ""
      }`}
    >
      {/* Preview Image */}
      <div className="group relative flex h-44 items-center justify-center overflow-hidden bg-gray-100">
        {app.cover ? (
          <img
            src={app.cover}
            alt={app.appName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-5xl text-gray-300">App</div>
        )}
        {/* Overlay with buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewChat?.(app.id)}
          >
            View Chat
          </Button>
          {app.deployKey && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewWork?.(app)}
            >
              View Work
            </Button>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={app.user?.userAvatar} />
          <AvatarFallback>
            {app.user?.userName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-800">
            {app.appName || "Unnamed App"}
          </h3>
          <p className="truncate text-sm text-gray-500">
            {app.user?.userName || (awesome ? "Official" : "Unknown User")}
          </p>
        </div>
      </div>
    </div>
  );
}
