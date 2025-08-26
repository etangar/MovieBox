<template>
  <div class="login-page">
    <div class="login-card">
      <h2>MovieBox Prijava</h2>
      
      <form @submit.prevent="login">
        <input 
          v-model="credentials.email" 
          type="email" 
          placeholder="E-mail" 
          required 
        />
        
        <input 
          v-model="credentials.password" 
          type="password" 
          placeholder="Lozinka" 
          required 
        />
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Šalje...' : 'Prijavi se' }}
        </button>
        
        <p class="error" v-if="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'

const router = useRouter()

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const login = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authAPI.login(credentials.value)
    
    localStorage.setItem('moviebox_token', response.data.token)
    localStorage.setItem('moviebox_user', JSON.stringify(response.data.user))
    window.location.reload()
    
    alert('Uspješna prijava!')
    router.push('/')
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Greška pri prijavi'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 400px;
  max-width: 90vw;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error {
  color: red;
  text-align: center;
}
</style>