import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface Props {
  app: API.AppVO
  featured?: boolean
  onViewChat?: (appId: string | number | undefined) => void
  onViewWork?: (app: API.AppVO) => void
}

export default function AppCard({ app, featured = false, onViewChat, onViewWork }: Props) {
  return (
    <div
      className={`bg-white/95 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-xl ${
        featured ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      {/* Preview Image */}
      <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden relative group">
        {app.cover ? (
          <img src={app.cover} alt={app.appName} className="w-full h-full object-cover" />
        ) : (
          <div className="text-5xl text-gray-300">🤖</div>
        )}
        {/* Overlay with buttons */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="default" size="sm" onClick={() => onViewChat?.(app.id)}>
            View Chat
          </Button>
          {app.deployKey && (
            <Button variant="secondary" size="sm" onClick={() => onViewWork?.(app)}>
              View Work
            </Button>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={app.user?.userAvatar} />
          <AvatarFallback>{app.user?.userName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-800 truncate">
            {app.appName || 'Unnamed App'}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {app.user?.userName || (featured ? 'Official' : 'Unknown User')}
          </p>
        </div>
      </div>
    </div>
  )
}
