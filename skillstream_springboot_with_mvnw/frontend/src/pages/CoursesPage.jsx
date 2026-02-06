import React, { useEffect, useMemo, useState } from 'react'
import { createApiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function CoursesPage() {
  const { token } = useAuth()
  const api = createApiClient(() => token)
  const [courses, setCourses] = useState([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('relevance')
  const [activeTag, setActiveTag] = useState('All')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [addingFav, setAddingFav] = useState(false)

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const url = q && q.trim() ? `/courses/search?query=${encodeURIComponent(q.trim())}` : '/courses'
      const { data } = await api.get(url)
      setCourses(Array.isArray(data) ? data : data?.courses || [])
    } catch (e) {
      setMessage('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  const allTags = useMemo(() => {
    const set = new Set()
    courses.forEach(c => (c.tags || []).forEach(t => set.add(String(t))))
    return ['All', ...Array.from(set).slice(0, 10)]
  }, [courses])

  const filtered = useMemo(() => {
    let list = courses
    if (activeTag !== 'All') {
      list = list.filter(c => (c.tags || []).includes(activeTag))
    }
    const trimmed = (q || '').trim()
    if (trimmed) {
      if (trimmed.startsWith('#')) {
        const tag = trimmed.slice(1).toLowerCase()
        list = list.filter(c => (c.tags || []).some(t => String(t).toLowerCase().includes(tag)))
      } else {
        const ql = trimmed.toLowerCase()
        list = list.filter(c =>
          String(c.title || '').toLowerCase().includes(ql) ||
          String(c.description || '').toLowerCase().includes(ql) ||
          String(c.instructor || '').toLowerCase().includes(ql)
        )
      }
    }
    if (sort === 'title') {
      list = [...list].sort((a,b) => String(a.title).localeCompare(String(b.title)))
    } else if (sort === 'instructor') {
      list = [...list].sort((a,b) => String(a.instructor).localeCompare(String(b.instructor)))
    }
    return list
  }, [courses, activeTag, sort, q])

  const addFav = async (course) => {
    if (addingFav) return; // Prevent double clicks
    
    setAddingFav(true);
    
    try {
      await api.post('/favourites', course)
      setMessageType('success')
      setMessage('✅ Successfully added to favorites!')
      setTimeout(() => setMessage(''), 2500)
    } catch (e) {
      const errorMsg = e?.response?.data?.msg || 'Failed to add favorite';
      if (e?.response?.status === 401 || !token) {
        setMessageType('error')
        setMessage('⚠️ Please login to add favorites');
      } else if (errorMsg.includes('Already') || errorMsg.includes('favourited')) {
        setMessageType('info')
        setMessage('ℹ️ Already in your favorites');
      } else {
        setMessageType('error')
        setMessage('❌ ' + errorMsg);
      }
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAddingFav(false);
    }
  }

  const clearFilters = () => {
    setQ('')
    setActiveTag('All')
    setSort('relevance')
  }

  return (
    <div className="container">
      <div className="hero">
        <h2 className="hero-title">🎓 No More Paid Courses</h2>
        <p className="hero-subtitle">
          Discover thousands of free courses • Learn anything, anytime
          <br />
          <span className="counter" style={{fontSize: 16, opacity: 0.8, marginTop: 8, display: 'inline-block'}}>
            ✨ {filtered.length} courses available
          </span>
        </p>
        <div className="searchbar">
          <input className="input" placeholder="#javascript or machine learning" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn-icon" onClick={fetchCourses} aria-label="search">🔍</button>
        </div>
        <div className="controls">
          <div className="chip-row">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`chip ${activeTag===tag ? 'active' : ''}`}
                onClick={() => { setActiveTag(tag); if (tag !== 'All') setQ(`#${tag}`); }}
              >
                {tag === 'All' ? '🌐 All' : tag}
              </button>
            ))}
          </div>
          {(q || activeTag !== 'All' || sort !== 'relevance') && (
            <button className="clear-btn" onClick={clearFilters} style={{marginLeft: 'auto'}}>✖ Clear filters</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({length:8}).map((_,i)=>(<div key={i} className="skeleton"/>))}
        </div>
      ) : (
        filtered.length ? (
          <div className="grid">
            {filtered.map((c) => {
              const rawImg = c.imageurl || c.image
              const imgSrc = rawImg && /^https?:\/\//i.test(rawImg)
                ? rawImg
                : (rawImg ? `https://${String(rawImg).replace(/^\/+/, '')}` : '')
              const handleCardClick = (e) => {
                // Don't navigate if clicking on button, link, or their children
                const target = e.target;
                if (target.tagName === 'BUTTON' || target.closest('button')) return;
                if (target.tagName === 'A' || target.closest('a')) return;
                if (c.courseurl) {
                  window.open(c.courseurl, '_blank', 'noopener,noreferrer');
                }
              };
              
              return (
                <div 
                  key={c.code || c.id} 
                  className={`card ${c.courseurl ? 'clickable' : ''}`}
                  onClick={handleCardClick}
                >
                  <div className="thumb-wrap">
                    {imgSrc ? (
                      <img
                        className="thumb"
                        src={imgSrc}
                        alt={c.title}
                        onError={(ev) => { ev.currentTarget.onerror = null; ev.currentTarget.src = 'https://via.placeholder.com/400x200?text=Course'; }}
                      />
                    ) : (
                      <div className="thumb" />
                    )}
                  </div>
                  <div className="card-body">
                    <div className="tag-row">
                      {(c.tags || []).slice(0,3).map((t, idx) => (
                        <span key={t} className={`badge ${idx===0 ? 'peach' : ''}`}>{t}</span>
                      ))}
                    </div>
                    <h3 className="card-title">{c.title}</h3>
                    <div className="card-sub">{c.instructor || c.provider || 'Unknown Instructor'}</div>
                    <p className="card-desc">{c.description || 'No description available for this course.'}</p>
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
                          // Use courseurl if available, otherwise generate from code
                          const url = c.courseurl || `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title || 'course')}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        🚀 Visit Course
                      </button>
                      <button 
                        type="button"
                        className="btn secondary" 
                        disabled={addingFav}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addFav({
                            code: c.code,
                            title: c.title,
                            instructor: c.instructor,
                            description: c.description,
                            imageurl: rawImg,
                            courseurl: c.courseurl,
                            tags: c.tags || []
                          });
                        }}
                      >
                        {addingFav ? '⏳ Adding...' : '❤️ Favorite'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty">No courses match your filters. Try a different search.</div>
        )
      )}

      {message && <div className={`toast ${messageType}`}>{message}</div>}
    </div>
  )
}
