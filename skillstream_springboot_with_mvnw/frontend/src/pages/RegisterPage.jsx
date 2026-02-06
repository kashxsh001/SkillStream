import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createApiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const api = createApiClient()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      if (data?.token) {
        login(data.token)
        navigate('/')
      } else {
        navigate('/login')
      }
    } catch (err) {
      setError(err?.response?.data?.msg || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub">Join thousands of learners and start your journey today</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              className="text-input"
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              className="text-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="pwd-field">
              <input
                id="password"
                className="text-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button type="button" className="pwd-toggle" onClick={()=>setShowPwd(v=>!v)}>
                {showPwd ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="helper">Must be at least 6 characters</div>
          </div>
          {error && <div className="error">⚠️ {error}</div>}
          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>
        <div className="auth-footer">
          <div className="helper">Already have an account? <Link to="/login">Log in</Link></div>
        </div>
      </div>
    </div>
  )
}


