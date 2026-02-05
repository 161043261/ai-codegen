import { CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  deployUrl: string
  onOpenSite?: () => void
}

export default function DeploySuccessModal({
  open,
  onOpenChange,
  deployUrl,
  onOpenSite,
}: Props) {
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(deployUrl)
      toast.success('Link copied to clipboard')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('Copy failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deploy Successful</DialogTitle>
        </DialogHeader>

        <div className="py-6 text-center">
          <div className="mb-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Website Deployed Successfully!</h3>
          <p className="text-gray-500 mb-6">
            Your website has been deployed. Access it via the link below:
          </p>

          <div className="relative mb-6">
            <Input value={deployUrl} readOnly className="pr-10" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={handleCopyUrl}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={onOpenSite}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
