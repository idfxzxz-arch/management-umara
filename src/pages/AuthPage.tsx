import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, KeyRound, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().optional(),
  remember: z.boolean().optional(),
})

type LoginValues = z.infer<typeof loginSchema>

export function AuthPage({ mode }: { mode: 'login' | 'forgot' | 'reset' }) {
  const { login, sendPasswordReset } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const onSubmit = async (values: LoginValues) => {
    if (mode !== 'login') {
      await sendPasswordReset(values.email)
      toast.success('Instruksi password dikirim via email.')
      navigate('/login')
      return
    }
    try {
      if (!values.password) {
        toast.error('Password wajib diisi')
        return
      }
      const user = await login(values.email, values.password, Boolean(values.remember))
      navigate(user.is_first_login ? '/change-password' : '/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login gagal')
    }
  }

  return (
    <main className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(21,128,61,0.14),transparent_32rem),linear-gradient(135deg,#f8faf7,#eef5ef_48%,#f7f1df)] lg:grid-cols-[1.02fr_0.98fr] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.13),transparent_32rem),linear-gradient(135deg,#07110d,#0d1713_48%,#17160e)]">
      <section className="flex items-center justify-center px-5 py-10">
        <Card className="w-full max-w-md border-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-8">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-green-700 text-lg font-bold text-white shadow-lg shadow-green-900/25">U</div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{mode === 'login' ? 'Login UMARA' : mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Gunakan email akun yang dibuat Developer atau Manager.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" type="email" {...register('email')} />
              </div>
              {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
            </label>
            {mode !== 'forgot' && (
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Password</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-9" type="password" {...register('password')} />
                </div>
                {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
              </label>
            )}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <input type="checkbox" className="h-4 w-4 accent-green-700" {...register('remember')} />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-semibold text-green-700">Forgot?</Link>
            </div>
            <Button className="w-full" disabled={isSubmitting}>
              {mode === 'login' ? 'Login' : 'Kirim Instruksi'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-5 text-xs text-slate-500">Akun dibuat melalui Supabase Auth dan tabel users. First login wajib ganti password.</p>
        </Card>
      </section>
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-lg font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-green-600">U</span>UMARA TAX</div>
        <div>
          <p className="max-w-2xl text-5xl font-bold leading-tight">Tax operations dashboard untuk pekerjaan, PIC, absensi, dan point staff.</p>
          <p className="mt-5 max-w-xl text-slate-300">Kelola Coretax, SP2DK, SPT Masa, SPT Tahunan, client, dan performa tim dalam satu ruang kerja.</p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3"><p className="text-2xl font-bold text-green-300">4</p><p className="text-slate-300">Kategori pajak</p></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3"><p className="text-2xl font-bold text-green-300">10+</p><p className="text-slate-300">Layanan</p></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3"><p className="text-2xl font-bold text-green-300">Live</p><p className="text-slate-300">Point staff</p></div>
          </div>
        </div>
      </section>
    </main>
  )
}
