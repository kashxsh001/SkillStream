import axios from 'axios'

// Auto-detect base URL:
// 1) VITE_API_BASE_URL if provided
// 2) If running on http(s) and the backend is reverse-proxied at /api/v1, use same-origin
// 3) Fallback to localhost dev server
const sameOrigin = typeof window !== 'undefined' && window.location && window.location.origin
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (sameOrigin ? `${sameOrigin}/api/v1` : '') ||
  'http://localhost:5000/api/v1'
)

export function createApiClient(getToken) {
  const instance = axios.create({ baseURL: BASE_URL })

  instance.interceptors.request.use((config) => {
    const token = getToken?.()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  return instance
}


