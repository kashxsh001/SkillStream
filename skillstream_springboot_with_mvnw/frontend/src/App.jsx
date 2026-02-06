import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, NavLink } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './enhancements.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CoursesPage from './pages/CoursesPage'
import FavoritesPage from './pages/FavoritesPage'
import AboutPage from './pages/AboutPage'
import AdminDashboard from './pages/AdminDashboard'
import Footer from './components/Footer'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function Navbar() {
  const { token, logout } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  // Get user info from token
  const getUserInfo = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.sub || 'User',
        name: payload.sub?.split('@')[0] || 'User',
        role: payload.role || 'USER'
      };
    } catch {
      return { email: 'User', name: 'User', role: 'USER' };
    }
  };
  
  const userInfo = getUserInfo();
  const isAdmin = userInfo && userInfo.role === 'ADMIN';
  
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') root.setAttribute('data-theme', 'light')
    else root.removeAttribute('data-theme')
    localStorage.setItem('theme', theme)
  }, [theme])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu])
  return (
    <nav className="navbar">
      <Link className="brand" to="/">Skillstream</Link>
      <div className="nav-actions">
        <NavLink className={({isActive}) => `nav-link pill ${isActive ? 'active' : ''}`} to="/">Home</NavLink>
        {token && <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/favorites">Favourites</NavLink>}
        {isAdmin && <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/admin">🛠️ Admin</NavLink>}
        <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/about">About</NavLink>
        {token ? (
          <div className="profile-menu">
            <button 
              className="profile-btn" 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">{userInfo?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <span className="profile-name">{userInfo?.name || 'User'}</span>
              <span className="profile-arrow">▼</span>
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-email">{userInfo?.email}</div>
                </div>
                <div className="profile-divider"></div>
                <button className="profile-menu-item" onClick={() => { logout(); setShowProfileMenu(false); }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/login">Login</NavLink>
            <span style={{opacity:0.5}}>/</span>
            <Link className="btn" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <Navbar />
        <main style={{flex: 1}}>
          <Routes>
            <Route path="/" element={<CoursesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}


