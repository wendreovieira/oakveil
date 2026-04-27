import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const loginSchema = z.object({
  email: z.string().min(1, 'Username or email is required'),
  password: z.string().min(6, 'Password must have at least 6 characters')
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'wendreo',
      password: '140718'
    }
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.token, data.email, data.roles)
      navigate('/')
    }
  })

  return (
    <div className='editor-grid flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md animate-floatIn'>
        <CardHeader>
          <CardTitle>Oakveil Editor Access</CardTitle>
          <CardDescription>Login with your backend JWT credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className='space-y-4' onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Username / Email</label>
              <Input {...form.register('email')} />
              {form.formState.errors.email ? <p className='text-xs text-destructive'>{form.formState.errors.email.message}</p> : null}
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium'>Password</label>
              <Input type='password' {...form.register('password')} />
              {form.formState.errors.password ? <p className='text-xs text-destructive'>{form.formState.errors.password.message}</p> : null}
            </div>

            {mutation.isError ? <p className='text-sm text-destructive'>Invalid credentials or backend unavailable.</p> : null}

            <Button className='w-full' type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
