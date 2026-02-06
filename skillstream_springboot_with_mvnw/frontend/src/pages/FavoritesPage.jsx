import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createApiClient } from '../api/client'

export default function FavoritesPage() {
  const { token } = useAuth()
  const api = createApiClient(() => token)
  const [favs, setFavs] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [removing, setRemoving] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/favourites')
      setFavs(Array.isArray(data) ? data : data?.favourites || data?.favorites || [])
    } catch (e) {
      setMessage('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const removeFav = async (code) => {
    if (removing === code) return;
    setRemoving(code);
    
    try {
      await api.delete(`/favourites/${code}`)
      setFavs(prev => prev.filter(f => (f.code ?? f.id) !== code))
      setMessageType('success')
      setMessage('✅ Removed from favorites')
      setTimeout(() => setMessage(''), 2000)
    } catch (e) {
      setMessageType('error')
      setMessage('❌ Failed to remove favorite')
      setTimeout(() => setMessage(''), 2500)
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="container">
      <div className="hero" style={{textAlign:'left'}}>
        <h2 className="hero-title" style={{fontSize:32}}>Your Favourites</h2>
        <p className="hero-subtitle">Saved courses you want to revisit. Total: {favs.length}</p>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({length:6}).map((_,i)=>(<div key={i} className="skeleton"/>))}
        </div>
      ) : favs.length ? (
        <div className="grid" style={{marginTop:20}}>
          {favs.map((c) => {
            const title = c.title || `Course #${c.code ?? c.id}`
            const instructor = c.instructor || c.provider || 'Unknown Instructor'
            const desc = c.description || 'No description available.'
            const rawImg = c.imageurl || c.image
            const imgSrc = rawImg && /^https?:\/\//i.test(rawImg)
              ? rawImg
              : (rawImg ? `https://${String(rawImg).replace(/^\/+/, '')}` : '')
            const url = c.courseurl
            const code = c.code ?? c.id
            
            const handleCardClick = (e) => {
              const target = e.target;
              if (target.tagName === 'BUTTON' || target.closest('button')) return;
              if (target.tagName === 'A' || target.closest('a')) return;
              if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            };
            
            return (
              <div 
                key={code} 
                className={`card ${url ? 'clickable' : ''}`}
                onClick={handleCardClick}
              >
                <div className="thumb-wrap">
                  {imgSrc ? (
                    <img
                      className="thumb"
                      src={imgSrc}
                      alt={title}
                      onError={(ev)=>{ev.currentTarget.onerror=null; ev.currentTarget.src='https://via.placeholder.com/400x200?text=Course';}}
                    />
                  ) : (
                    <div className="thumb" />
                  )}
                </div>
                <div className="card-body">
                  <div className="tag-row">
                    <span className="badge peach">💖 Favorite</span>
                    {(c.tags || []).slice(0,2).map((t, idx) => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                  <h3 className="card-title">{title}</h3>
                  <div className="card-sub">{instructor}</div>
                  <p className="card-desc">{desc}</p>
                  <div className="meta">
                    <span className="rating">⭐ 4.8</span>
                    <span>•</span>
                    <span>{c.duration ? `${c.duration}h` : 'Self-paced'}</span>
                  </div>
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      className="btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Use courseurl if available, otherwise generate from title
                        const courseUrl = url || `https://www.youtube.com/results?search_query=${encodeURIComponent(title || 'course')}`;
                        window.open(courseUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      🚀 Visit Course
                    </button>
                    <button 
                      type="button"
                      className="btn secondary" 
                      disabled={removing === code}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFav(code);
                      }}
                    >
                      {removing === code ? '⏳ Removing' : '🗑️ Remove'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty" style={{marginTop:20}}>
          You don't have any favourites yet.
          <div style={{marginTop:10}}>
            Browse courses on the Home page and click "Add to Favorites" to save them here.
          </div>
        </div>
      )}

      {message && <div className={`toast ${messageType}`}>{message}</div>}
    </div>
  )
}


