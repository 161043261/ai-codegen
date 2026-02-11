import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AppCard from "@/components/app-card";
import { useUserStore } from "@/stores/user-store";
import {
  useMyAppVoByPage,
  useFeaturedAppVoByPage,
} from "@/hooks/queries/use-app-queries";
import { useAddAppMutation } from "@/hooks/mutations/use-app-mutations";
import { getDeployUrl } from "@/config";

const quickPrompts = [
  {
    label: "Personal Blog",
    prompt:
      "Create a modern personal blog website with article list, detail page, category tags, search function, comment system, and about page. Use clean design, responsive layout, Markdown support, homepage shows latest and recommended articles.",
  },
  {
    label: "Corporate Website",
    prompt:
      "Design a professional corporate website with company intro, products/services, news, and contact pages. Business style design with carousel, product cards, team intro, case studies, multi-language support and live chat.",
  },
  {
    label: "Online Store",
    prompt:
      "Build a complete e-commerce site with product display, shopping cart, user auth, order management, and payment. Modern product cards, search filters, reviews, coupons, and membership points.",
  },
  {
    label: "Portfolio Website",
    prompt:
      "Create a beautiful portfolio website for designers, photographers, or artists. Include gallery, project details, resume, and contact info. Masonry or grid layout, image preview, and category filtering.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { loginUser } = useUserStore();
  const [userPrompt, setUserPrompt] = useState("");

  const myAppsQuery = useMyAppVoByPage(
    { pageNum: 1, pageSize: 6, sortField: "createTime", sortOrder: "desc" },
    !!loginUser?.id,
  );

  const featuredAppsQuery = useFeaturedAppVoByPage({
    pageNum: 1,
    pageSize: 6,
    sortField: "createTime",
    sortOrder: "desc",
  });

  const addAppMutation = useAddAppMutation();

  const createApp = async () => {
    if (!userPrompt.trim()) {
      toast.warning("Please enter app description");
      return;
    }
    if (!loginUser?.id) {
      toast.warning("Please login first");
      navigate("/user/login");
      return;
    }

    addAppMutation.mutate(
      { initPrompt: userPrompt.trim() },
      {
        onSuccess: (data) => {
          if (data.code === 0 && data.data) {
            toast.success("App created successfully");
            navigate(`/app/chat/${data.data}`);
          } else {
            toast.error("Creation failed: " + data.message);
          }
        },
        onError: () => {
          toast.error("Creation failed, please retry");
        },
      },
    );
  };

  const viewChat = (appId: string | number | undefined) => {
    if (appId) navigate(`/app/chat/${appId}?view=1`);
  };

  const viewWork = (app: API.AppVO) => {
    if (app.deployKey) {
      window.open(getDeployUrl(app.deployKey), "_blank");
    }
  };

  const myApps = myAppsQuery.data?.records ?? [];
  const featuredApps = featuredAppsQuery.data?.records ?? [];

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: `
          linear-gradient(180deg, #f8fafc 0%, #f1f5f9 8%, #e2e8f0 20%, #cbd5e1 100%),
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)
        `,
      }}
    >
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-5">
        {/* Hero Section */}
        <div className="mb-7 py-20 text-center">
          <h1
            className="mb-5 text-5xl leading-tight font-bold md:text-6xl"
            style={{
              background:
                "linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AI App Generator
          </h1>
          <p className="text-xl text-gray-500">
            Create website apps with just one sentence
          </p>
        </div>

        {/* Input Section */}
        <div className="relative mx-auto mb-6 max-w-3xl">
          <Textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Help me create a personal blog website"
            rows={4}
            maxLength={1000}
            className="rounded-2xl border-none bg-white/95 p-5 pr-16 text-base shadow-xl backdrop-blur-lg transition-all focus:bg-white focus:shadow-2xl"
          />
          <div className="absolute right-3 bottom-3">
            <Button
              onClick={createApp}
              disabled={addAppMutation.isPending}
              size="icon"
              className="rounded-full"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-16 flex flex-wrap justify-center gap-3">
          {quickPrompts.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              onClick={() => setUserPrompt(item.prompt)}
              className="h-auto rounded-full border-blue-200 bg-white/80 px-5 py-2 text-gray-600 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white/90 hover:text-blue-600"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* My Apps Section */}
        {loginUser?.id && (
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-semibold text-gray-800">
              My Apps
            </h2>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onViewChat={viewChat}
                  onViewWork={viewWork}
                />
              ))}
            </div>
            {myApps.length === 0 && (
              <p className="py-8 text-center text-gray-400">
                No apps yet. Create your first app!
              </p>
            )}
          </section>
        )}

        {/* Featured Apps Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-semibold text-gray-800">
            Featured Cases
          </h2>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                featured
                onViewChat={viewChat}
                onViewWork={viewWork}
              />
            ))}
          </div>
          {featuredApps.length === 0 && (
            <p className="py-8 text-center text-gray-400">
              No featured apps yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
