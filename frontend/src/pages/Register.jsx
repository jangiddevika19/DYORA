import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/home')
    } catch (err) {
      setError(err.friendlyMessage || 'Could not create your account. Please try again.')
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Meet your new personal AI companion">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
        />
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
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="At least 6 characters"
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-ivory-300)]">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-plum-300)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
