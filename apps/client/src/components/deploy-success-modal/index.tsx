import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deployUrl: string;
  onOpenSite?: () => void;
}

export default function DeploySuccessModal({
  open,
  onOpenChange,
  deployUrl,
  onOpenSite,
}: Props) {
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(deployUrl);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Copy failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Deploy Successful</DialogTitle>
        </DialogHeader>

        <div className="py-6 text-center">
          <div className="mb-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          </div>
          <h3 className="mb-4 text-xl font-semibold">
            Website Deployed Successfully!
          </h3>
          <p className="mb-6 text-gray-500">
            Your website has been deployed. Access it via the link below:
          </p>

          <div className="relative mb-6">
            <Input value={deployUrl} readOnly className="pr-10" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              onClick={handleCopyUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center gap-3">
            <Button onClick={onOpenSite}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Website
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
