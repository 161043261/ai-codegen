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
import { useRegisterMutation } from "@/hooks/mutations/use-user-mutations";

const formSchema = z
  .object({
    userAccount: z.string().min(1, "Please enter account"),
    userPassword: z.string().min(8, "Password must be at least 8 characters"),
    checkPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.userPassword === data.checkPassword, {
    message: "Passwords do not match",
    path: ["checkPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function UserRegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAccount: "yukino161043261@gmail.com",
      userPassword: "Shita0228",
      checkPassword: "Shita0228",
    },
  });

  const onSubmit = (values: FormValues) => {
    registerMutation.mutate(values, {
      onSuccess: (data) => {
        if (data.code === 0) {
          toast.success("Registration successful");
          navigate("/user/login", { replace: true });
        } else {
          toast.error("Registration failed: " + data.message);
        }
      },
      onError: () => {
        toast.error("Registration failed, please retry");
      },
    });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            AI App Generator - Register
          </CardTitle>
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
              <FormField
                control={form.control}
                name="checkPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/user/login"
                  className="text-blue-500 hover:underline"
                >
                  Login
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
