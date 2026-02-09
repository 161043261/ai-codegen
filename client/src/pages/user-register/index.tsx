import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userRegister } from "@/api/user";

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
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAccount: "",
      userPassword: "",
      checkPassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await userRegister(values);
      if (res.data.code === 0) {
        toast.success("Registration successful");
        navigate("/user/login", { replace: true });
      } else {
        toast.error("Registration failed: " + res.data.message);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed, please retry");
    } finally {
      setLoading(false);
    }
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
