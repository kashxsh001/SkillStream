import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { createApiClient } from '../api/client'
import { useNavigate } from 'react-router-dom'
import '../admin.css'

export default function AdminDashboard() {
  const { token } = useAuth()
  const api = createApiClient(() => token)
  const navigate = useNavigate()
  
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    provider: '',
    image: '',
    duration: '',
    courseurl: '',
    tags: ''
  })

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      if (!token) {
        navigate('/login')
        return
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role !== 'ADMIN') {
          showMessage('Access denied. Admin privileges required.', 'error')
          setTimeout(() => navigate('/'), 2000)
        }
      } catch {
        navigate('/login')
      }
    }
    checkAdmin()
  }, [token, navigate])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      console.log('Fetching courses from /admin/courses...')
      const { data } = await api.get('/admin/courses')
      console.log('Courses received:', data)
      setCourses(Array.isArray(data) ? data : [])
      if (!Array.isArray(data) || data.length === 0) {
        showMessage('No courses found. Add your first course!', 'info')
      }
    } catch (e) {
      console.error('Error fetching courses:', e)
      const errorMsg = e.response?.data?.msg || e.response?.data?.message || e.message
      showMessage('Failed to load courses: ' + errorMsg, 'error')
      // If 403, user is not admin
      if (e.response?.status === 403) {
        setTimeout(() => navigate('/'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (msg, type = 'success') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      provider: '',
      image: '',
      duration: '',
      courseurl: '',
      tags: ''
    })
    setEditingCourse(null)
    setShowAddForm(false)
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.code || !formData.title || !formData.description) {
      showMessage('Please fill in all required fields (Code, Title, Description)', 'error')
      return
    }
    
    try {
      // Convert tags from comma-separated string to array
      const tagsArray = formData.tags?.trim() 
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
        : [];
      
      const courseData = {
        code: parseInt(formData.code),
        title: formData.title.trim(),
        description: formData.description.trim(),
        provider: formData.provider?.trim() || null,
        image: formData.image?.trim() || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        courseurl: formData.courseurl?.trim() || null,
        tags: tagsArray.length > 0 ? tagsArray : null
      }
      
      console.log('Sending course data:', JSON.stringify(courseData, null, 2))
      const response = await api.post('/admin/courses', courseData)
      console.log('Course added:', response.data)
      showMessage('Course added successfully!', 'success')
      fetchCourses()
      resetForm()
    } catch (e) {
      console.error('Full error object:', e)
      console.error('Error response:', e.response)
      console.error('Error response data:', JSON.stringify(e.response?.data, null, 2))
      console.error('Error message:', e.message)
      
      const errorMsg = e.response?.data?.msg 
        || e.response?.data?.message 
        || e.response?.data?.error
        || JSON.stringify(e.response?.data)
        || e.message
      
      showMessage('Failed to add course: ' + errorMsg, 'error')
    }
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    try {
      // Convert tags from comma-separated string to array
      const tagsArray = formData.tags?.trim() 
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
        : [];
      
      const courseData = {
        title: formData.title?.trim() || null,
        description: formData.description?.trim() || null,
        provider: formData.provider?.trim() || null,
        image: formData.image?.trim() || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        courseurl: formData.courseurl?.trim() || null,
        tags: tagsArray.length > 0 ? tagsArray : null
      }
      await api.put(`/admin/courses/${editingCourse.id}`, courseData)
      showMessage('Course updated successfully!', 'success')
      fetchCourses()
      resetForm()
    } catch (e) {
      showMessage('Failed to update course: ' + (e.response?.data?.msg || e.message), 'error')
    }
  }

  const handleEditClick = (course) => {
    setEditingCourse(course)
    // Convert tags array to comma-separated string for the form
    const tagsString = Array.isArray(course.tags) 
      ? course.tags.join(',') 
      : (course.tags || '');
    
    setFormData({
      code: course.code || '',
      title: course.title || '',
      description: course.description || '',
      provider: course.provider || '',
      image: course.image || '',
      duration: course.duration || '',
      courseurl: course.courseurl || '',
      tags: tagsString
    })
    setShowAddForm(true)
  }

  const handleDeleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    
    try {
      await api.delete(`/admin/courses/${id}`)
      showMessage('Course deleted successfully!', 'success')
      fetchCourses()
    } catch (e) {
      showMessage('Failed to delete course: ' + (e.response?.data?.msg || e.message), 'error')
    }
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1 className="admin-title">🛠️ Admin Dashboard</h1>
        <button 
          className="btn" 
          onClick={() => {
            resetForm()
            setShowAddForm(!showAddForm)
          }}
        >
          {showAddForm ? '✖ Cancel' : '➕ Add New Course'}
        </button>
      </div>

      {/* Site Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-value">{(() => {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.sub?.split('@')[0] || 'Admin';
              } catch {
                return 'Admin';
              }
            })()}</div>
            <div className="stat-label">Active User</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <div className="stat-value">{(() => {
              const allTags = new Set();
              courses.forEach(c => {
                if (Array.isArray(c.tags)) {
                  c.tags.forEach(tag => allTags.add(tag));
                }
              });
              return allTags.size;
            })()}</div>
            <div className="stat-label">Unique Tags</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{(() => {
              const totalHours = courses.reduce((sum, c) => sum + (c.duration || 0), 0);
              return totalHours;
            })()}h</div>
            <div className="stat-label">Total Duration</div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`toast ${messageType}`}>
          {message}
        </div>
      )}

      {showAddForm && (
        <div className="admin-form-card">
          <h2>{editingCourse ? '✏️ Edit Course' : '➕ Add New Course'}</h2>
          <form onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse}>
            <div className="form-row">
              <div className="field">
                <label>Course Code * <span style={{color: '#ef4444', fontSize: '12px'}}>(Required)</span></label>
                <input
                  type="number"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  disabled={editingCourse !== null}
                  className="text-input"
                  placeholder="e.g., 101"
                />
              </div>
              <div className="field">
                <label>Title * <span style={{color: '#ef4444', fontSize: '12px'}}>(Required)</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="text-input"
                  placeholder="e.g., Complete Java Programming"
                />
              </div>
            </div>

            <div className="field">
              <label>Description * <span style={{color: '#ef4444', fontSize: '12px'}}>(Required)</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                className="text-input"
                placeholder="Enter a detailed description of the course..."
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Provider</label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  className="text-input"
                />
              </div>
              <div className="field">
                <label>Duration (hours)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="text-input"
                />
              </div>
            </div>

            <div className="field">
              <label>Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="text-input"
              />
            </div>

            <div className="field">
              <label>Course URL</label>
              <input
                type="url"
                name="courseurl"
                value={formData.courseurl}
                onChange={handleInputChange}
                className="text-input"
              />
            </div>

            <div className="field">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Java,Spring,Backend"
                className="text-input"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn">
                {editingCourse ? '💾 Update Course' : '➕ Add Course'}
              </button>
              <button type="button" className="btn secondary" onClick={resetForm}>
                ✖ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-courses-section">
        <h2>📚 All Courses ({courses.length})</h2>
        
        {loading ? (
          <div className="loading">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">No courses found. Add your first course!</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Provider</th>
                  <th>Duration</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>{course.code}</td>
                    <td>{course.title}</td>
                    <td>{course.provider || 'N/A'}</td>
                    <td>{course.duration ? `${course.duration}h` : 'N/A'}</td>
                    <td>
                      <div className="tag-list">
                        {(Array.isArray(course.tags) 
                          ? course.tags 
                          : (course.tags || '').split(',').filter(t => t.trim())
                        ).slice(0, 3).map((tag, i) => (
                          <span key={i} className="mini-badge">{typeof tag === 'string' ? tag.trim() : tag}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-small" 
                          onClick={() => handleEditClick(course)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn-small danger" 
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
