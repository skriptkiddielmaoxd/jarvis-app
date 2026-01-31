import axios from 'axios'

// Use relative baseURL so Vite dev proxy works and built app can use same paths.
const API = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Normalize errors into a consistent shape: { type, message, status?, data? }
API.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      // Axios error with response from server
      if (err && err.response) {
        const status = err.response.status
        let type = 'server_error'
        if (status === 400) type = 'validation'
        else if (status === 401) type = 'unauthorized'
        else if (status === 404) type = 'not_found'
        else if (status >= 500) type = 'server_error'

        const message = err.response.data?.message || `Server error (${status})`
        return Promise.reject({ type, message, status, data: err.response.data })
      }

      // Request made but no response received
      if (err && err.request) {
        return Promise.reject({ type: 'network', message: 'Network error: no response from server' })
      }

      // Something happened setting up the request
      return Promise.reject({ type: 'client', message: err?.message || 'Request setup failed' })
    } catch (e) {
      return Promise.reject({ type: 'unknown', message: 'An unknown error occurred' })
    }
  }
)

export default API
