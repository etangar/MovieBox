<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-lg">Profil korisnika</div>
    
    <div class="row q-gutter-lg">
      <!-- User Info -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Osobni podaci</div>
            
            <div class="q-mt-md">
              <q-input 
                v-model="user.username" 
                label="Korisničko ime"
                readonly
                filled
                class="q-mb-md"
              />
              
              <q-input 
                v-model="user.email" 
                label="Email"
                readonly
                filled
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
              
              <div class="text-body2 text-grey-6">
                Član od: {{ formatDate(user.created_at) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistics -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Statistike</div>
            
            <div class="q-mt-md">
              <div class="row q-gutter-md">
                <div class="col text-center">
                  <div class="text-h4 text-primary">{{ watchlistStats.gledano }}</div>
                  <div class="text-body2">Gledano filmova</div>
                </div>
                
                <div class="col text-center">
                  <div class="text-h4 text-secondary">{{ watchlistStats.planirano }}</div>
                  <div class="text-body2">Planirano filmova</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row q-gutter-md q-mt-lg">
      <div class="col-12 col-md-4">
        <q-btn 
          label="Moja Lista" 
          color="primary" 
          to="/watchlist" 
          class="full-width"
        />
      </div>
      
      <div class="col-12 col-md-4">
        <q-btn 
          label="Filmovi" 
          color="secondary" 
          to="/filmovi" 
          class="full-width"
        />
      </div>
      
      <div class="col-12 col-md-4">
        <q-btn 
          label="Odjava" 
          color="negative" 
          outline
          @click="logout" 
          class="full-width"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userAPI } from '../services/api'

defineOptions({
  name: 'ProfilePage'
})

const router = useRouter()

const user = ref({})
const watchlistStats = ref({
  gledano: 0,
  planirano: 0
})

const loadUser = () => {
  const userData = localStorage.getItem('moviebox_user')
  if (userData) {
    user.value = JSON.parse(userData)
  } else {
    router.push('/login')
  }
}

const loadWatchlistStats = async () => {
  try {
    const [gledanoResponse, planiranoResponse] = await Promise.all([
      userAPI.getWatchlist('gledano'),
      userAPI.getWatchlist('planirano')
    ])
    
    watchlistStats.value = {
      gledano: gledanoResponse.data.watchlist.length,
      planirano: planiranoResponse.data.watchlist.length
    }
  } catch (error) {
    console.error('Load stats error:', error)
  }
}

const logout = () => {
  if (confirm('Jeste li sigurni da se želite odjaviti?')) {
    localStorage.removeItem('moviebox_token')
    localStorage.removeItem('moviebox_user')
    router.push('/login')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadUser()
  loadWatchlistStats()
})
</script>