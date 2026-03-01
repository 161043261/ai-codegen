import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import UserInfo from "@/components/user-info";
import { getStaticPreviewUrl } from "@/config";
import {
  useUpdateAppByAdminMutation,
  useUpdateAppMutation,
} from "@/hooks/mutations/use-app-mutations";
import { useAppVoById } from "@/hooks/queries/use-app-queries";
import { useUserStore } from "@/stores/user-store";
import { formatCodegenType } from "@/utils/codegen-types";
import { formatTime } from "@/utils/time";

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

  const numericId = id ? Number(id) : undefined;
  const { data: appInfo, isLoading: loading } = useAppVoById(numericId);

  const updateAppMutation = useUpdateAppMutation();
  const updateAppByAdminMutation = useUpdateAppByAdminMutation();
  const submitting =
    updateAppMutation.isPending || updateAppByAdminMutation.isPending;

  const isAdmin = loginUser.userRole === "admin";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appName: "",
      cover: "",
      priority: 0,
    },
  });

  // Fill form when appInfo loads
  useEffect(() => {
    if (!id) {
      toast.error("App ID does not exist");
      navigate("/");
      return;
    }
    if (appInfo) {
      // Check permission
      if (!isAdmin && appInfo.userId !== loginUser.id) {
        toast.error("You do not have permission to edit this app");
        navigate("/");
        return;
      }
      form.reset({
        appName: appInfo.appName || "",
        cover: appInfo.cover || "",
        priority: appInfo.priority || 0,
      });
    } else if (appInfo === null) {
      toast.error("Failed to get app info");
      navigate("/");
    }
  }, [appInfo, id, isAdmin, loginUser.id, navigate, form]);

  // Submit form
  const onSubmit = (data: FormValues) => {
    if (!appInfo?.id) return;

    const onSuccess = (res: { code?: number; message?: string }) => {
      if (res.code === 0) {
        toast.success("Update successful");
      } else {
        toast.error("Update failed: " + res.message);
      }
    };
    const onError = () => {
      toast.error("Update failed");
    };

    if (isAdmin) {
      updateAppByAdminMutation.mutate(
        {
          id: appInfo.id,
          appName: data.appName,
          cover: data.cover,
          priority: data.priority,
        },
        { onSuccess, onError },
      );
    } else {
      updateAppMutation.mutate(
        {
          id: appInfo.id,
          appName: data.appName,
        },
        { onSuccess, onError },
      );
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
                                className="h-auto max-w-50 rounded"
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
                              className="w-50"
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
                            Set to 99 for awesome app
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
