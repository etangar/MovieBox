import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('moviebox_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Autentifkcja
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
}

// Films
export const filmsAPI = {
  getAll: (params) => api.get('/films', { params }),
  getById: (id) => api.get(`/films/${id}`),
create: (filmData) => api.post('/films', filmData),
  delete: (id) => api.delete(`/films/${id}`)    
}
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  deleteComment: (commentId) => api.delete(`/admin/comments/${commentId}`)
}



export default api