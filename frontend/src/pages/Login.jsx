import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(form)
      navigate('/home')
    } catch (err) {
      setError(err.friendlyMessage || 'Could not sign you in. Please check your details.')
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue with DYORA">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-ivory-300)]">
        New to DYORA?{' '}
        <Link to="/register" className="text-[var(--color-plum-300)] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
