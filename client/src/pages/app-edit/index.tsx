import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import UserInfo from "@/components/user-info";
import { useUserStore } from "@/stores/user-store";
import { getAppVoById, updateApp, updateAppByAdmin } from "@/api/app";
import { formatCodegenType } from "@/utils/codegen-types";
import { formatTime } from "@/utils/time";
import { getStaticPreviewUrl } from "@/config";

const formSchema = z.object({
  appName: z
    .string()
    .min(1, "Please enter app name")
    .max(50, "App name should be 1-50 characters"),
  cover: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
  priority: z
    .number()
    .min(0, "Priority range is 0-99")
    .max(99, "Priority range is 0-99")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AppEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loginUser } = useUserStore();

  const [appInfo, setAppInfo] = useState<API.AppVO>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = loginUser.userRole === "admin";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appName: "",
      cover: "",
      priority: 0,
    },
  });

  // Fetch app info
  const fetchAppInfo = useCallback(async () => {
    if (!id) {
      toast.error("App ID does not exist");
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const res = await getAppVoById({ id: Number(id) });
      if (res.data.code === 0 && res.data.data) {
        const app = res.data.data;
        setAppInfo(app);

        // Check permission
        if (!isAdmin && app.userId !== loginUser.id) {
          toast.error("You do not have permission to edit this app");
          navigate("/");
          return;
        }

        // Fill form data
        form.reset({
          appName: app.appName || "",
          cover: app.cover || "",
          priority: app.priority || 0,
        });
      } else {
        toast.error("Failed to get app info");
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to get app info:", error);
      toast.error("Failed to get app info");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [form, id, isAdmin, loginUser.id, navigate]);

  useEffect(() => {
    fetchAppInfo();
  }, [id, fetchAppInfo]);

  // Submit form
  const onSubmit = async (data: FormValues) => {
    if (!appInfo?.id) return;

    setSubmitting(true);
    try {
      let res;
      if (isAdmin) {
        res = await updateAppByAdmin({
          id: appInfo.id,
          appName: data.appName,
          cover: data.cover,
          priority: data.priority,
        });
      } else {
        res = await updateApp({
          id: appInfo.id,
          appName: data.appName,
        });
      }

      if (res.data.code === 0) {
        toast.success("Update successful");
        await fetchAppInfo();
      } else {
        toast.error("Update failed: " + res.data.message);
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    if (appInfo) {
      form.reset({
        appName: appInfo.appName || "",
        cover: appInfo.cover || "",
        priority: appInfo.priority || 0,
      });
    }
  };

  // Go to chat page
  const goToChat = () => {
    if (appInfo?.id) {
      navigate(`/app/chat/${appInfo.id}`);
    }
  };

  // Open preview
  const openPreview = () => {
    if (appInfo?.codegenType && appInfo?.id) {
      const url = getStaticPreviewUrl(appInfo.codegenType, String(appInfo.id));
      window.open(url, "_blank");
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit App Info</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter app name"
                          maxLength={50}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isAdmin && (
                  <>
                    <FormField
                      control={form.control}
                      name="cover"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Cover</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter cover image URL"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Supports image links, recommended size: 400x300
                          </FormDescription>
                          {field.value && (
                            <div className="mt-3 rounded-lg border bg-gray-50 p-3">
                              <img
                                src={field.value}
                                alt="Cover preview"
                                className="h-auto max-w-[200px] rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={99}
                              className="w-[200px]"
                              value={field.value ?? 0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormDescription>
                            Set to 99 for featured app
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div>
                  <FormLabel>Initial Prompt</FormLabel>
                  <Textarea
                    value={appInfo?.initPrompt || ""}
                    placeholder="Initial prompt"
                    rows={4}
                    maxLength={1000}
                    disabled
                    className="mt-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Initial prompt cannot be modified
                  </p>
                </div>

                <div>
                  <FormLabel>Generation Type</FormLabel>
                  <Input
                    value={formatCodegenType(appInfo?.codegenType || "")}
                    placeholder="Generation type"
                    disabled
                    className="mt-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Generation type cannot be modified
                  </p>
                </div>

                {appInfo?.deployKey && (
                  <div>
                    <FormLabel>Deploy Key</FormLabel>
                    <Input
                      value={appInfo.deployKey}
                      placeholder="Deploy key"
                      disabled
                      className="mt-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Deploy key cannot be modified
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                  <Button type="button" variant="link" onClick={goToChat}>
                    Go to Chat
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Info</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded border p-3">
                <div className="mb-1 text-sm text-gray-500">App ID</div>
                <div className="font-medium">{appInfo?.id}</div>
              </div>
              <div className="rounded border p-3">
                <div className="mb-1 text-sm text-gray-500">Creator</div>
                <UserInfo user={appInfo?.user} size="sm" />
              </div>
              <div className="rounded border p-3">
                <div className="mb-1 text-sm text-gray-500">Created At</div>
                <div className="font-medium">
                  {formatTime(appInfo?.createTime)}
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="mb-1 text-sm text-gray-500">Updated At</div>
                <div className="font-medium">
                  {formatTime(appInfo?.updateTime)}
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="mb-1 text-sm text-gray-500">Deployed At</div>
                <div className="font-medium">
                  {appInfo?.deployedTime
                    ? formatTime(appInfo.deployedTime)
                    : "Not deployed"}
                </div>
              </div>
              <div className="rounded border p-3">
                <div className="mb-1 text-sm text-gray-500">Preview Link</div>
                {appInfo?.deployKey ? (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={openPreview}
                  >
                    View Preview
                  </Button>
                ) : (
                  <span className="text-gray-400">Not deployed</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
