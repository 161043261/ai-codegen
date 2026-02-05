import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/userStore'
import { userLogin } from '@/api/userController'

const formSchema = z.object({
  userAccount: z.string().min(1, 'Please enter account'),
  userPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = z.infer<typeof formSchema>

export default function UserLoginPage() {
  const navigate = useNavigate()
  const { fetchLoginUser } = useUserStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAccount: '',
      userPassword: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const res = await userLogin(values)
      if (res.data.code === 0 && res.data.data) {
        await fetchLoginUser()
        toast.success('Login successful')
        navigate('/', { replace: true })
      } else {
        toast.error('Login failed: ' + res.data.message)
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed, please retry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
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
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/user/register" className="text-blue-500 hover:underline">
                  Register
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
