import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/hooks/mutations/use-user-mutations";
import { useUserStore } from "@/stores/user-store";

const formSchema = z.object({
  userAccount: z.string().min(1, "Please enter account"),
  userPassword: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function UserLoginPage() {
  const navigate = useNavigate();
  const { fetchLoginUser } = useUserStore();
  const loginMutation = useLoginMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAccount: "yukino161043261@gmail.com",
      userPassword: "Shita0228",
    },
  });

  const onSubmit = (values: FormValues) => {
    loginMutation.mutate(values, {
      onSuccess: async (data) => {
        if (data.code === 0 && data.data) {
          await fetchLoginUser();
          toast.success("Login successful");
          navigate("/", { replace: true });
        } else {
          toast.error("Login failed: " + data.message);
        }
      },
      onError: () => {
        toast.error("Login failed, please retry");
      },
    });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">AI App Generator - Login</CardTitle>
          <CardDescription>
            Create complete apps without writing code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/user/register"
                  className="text-blue-500 hover:underline"
                >
                  Register
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
