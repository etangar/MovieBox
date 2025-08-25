<!-- frontend/src/pages/RegistracijaPage.vue -->
<template>
  <q-page class="flex flex-center">
    <q-card style="width: 400px; max-width: 90vw">
      <q-card-section>
        <div class="text-h5 text-center">MovieBox Registracija</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="register">
          <q-input
            v-model="user.username"
            label="Korisničko ime"
            filled
            required
            class="q-mb-md"
          />

          <q-input
            v-model="user.first_name"
            label="Ime"
            filled
            class="q-mb-md"
          />

          <q-input
            v-model="user.last_name"
            label="Prezime"
            filled
            class="q-mb-md"
          />

          <q-input
            v-model="user.email"
            label="E-mail"
            type="email"
            filled
            required
            class="q-mb-md"
          />

          <q-input
            v-model="user.password"
            label="Lozinka"
            type="password"
            filled
            required
            class="q-mb-md"
          />

          <q-input
            v-model="user.confirmPassword"
            label="Potvrdi lozinku"
            type="password"
            filled
            required
            class="q-mb-md"
            :error="user.password !== user.confirmPassword && user.confirmPassword !== ''"
            error-message="Lozinke se ne podudaraju"
          />

          <q-btn
            label="Registriraj se"
            type="submit"
            color="primary"
            :loading="loading"
            :disable="user.password !== user.confirmPassword"
            class="full-width q-mb-md"
          />

          <div class="text-center">
            <router-link to="/login" class="text-primary">
              Već imaš račun? Prijavi se
            </router-link>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authAPI } from '../services/api'

defineOptions({
  name: 'RegistracijaPage'
})

const router = useRouter()
const $q = useQuasar()

const user = ref({
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const register = async () => {
  console.log('Starting registration...')
  
  if (user.value.password !== user.value.confirmPassword) {
    alert('Lozinke se ne podudaraju')
    return
  }

  loading.value = true

  try {
    const { confirmPassword, ...userData } = user.value
    console.log('Sending data:', userData)
    
    const response = await authAPI.register(userData)
    console.log('Got response:', response.data)
    
    localStorage.setItem('moviebox_token', response.data.token)
    localStorage.setItem('moviebox_user', JSON.stringify(response.data.user))
    
    alert('Uspješna registracija!')
    console.log('About to redirect...')
    router.push('/')
    
  } catch (err) {
    console.log('Registration error:', err)
    alert(err.response?.data?.message || 'Greška pri registraciji')
  } finally {
    loading.value = false
  }
}
</script>