import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
}

// Films
export const filmsAPI = {
  getAll: (params) => api.get('/films', { params }),
  getById: (id) => api.get(`/films/${id}`)
}

export default api