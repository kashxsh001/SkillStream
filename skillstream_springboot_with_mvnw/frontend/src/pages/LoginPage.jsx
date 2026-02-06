import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createApiClient } from '../api/client'

export default function LoginPage() {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const api = createApiClient(() => token)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        email: (form.email || '').trim().toLowerCase(),
        password: form.password
      }
      const { data } = await api.post('/auth/login', payload)
      if (data?.token) {
        login(data.token)
        navigate('/')
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-sub">Log in to continue your learning journey</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button type="button" className="pwd-toggle" onClick={()=>setShowPwd(v=>!v)}>
                {showPwd ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          {error && <div className="error">⚠️ {error}</div>}
          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </div>
        </form>
        <div className="auth-footer">
          <div className="helper">Don't have an account? <Link to="/register">Create one</Link></div>
        </div>
      </div>
    </div>
  )
}


