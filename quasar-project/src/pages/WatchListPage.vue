<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Moja Lista</div>
    
    <q-tabs v-model="activeTab" class="text-primary q-mb-md">
      <q-tab name="all" label="Sve" />
      <q-tab name="planirano" label="Planirano" />
      <q-tab name="gledano" label="Gledano" />
    </q-tabs>

    <div v-if="loading" class="flex flex-center">
      <q-spinner size="50px" color="primary" />
    </div>

    <div v-else-if="watchlist.length === 0" class="text-center q-mt-xl">
      <q-icon name="bookmark" size="4rem" color="grey-5" />
      <div class="text-h6 text-grey-6 q-mt-md">
        Nema stavki u listi
      </div>
    </div>

    <div v-else class="row q-gutter-md">
      <div
        v-for="item in filteredWatchlist"
        :key="item.id"
        class="col-lg-3 col-md-4 col-sm-6 col-xs-12"
      >
        <q-card class="cursor-pointer" @click="goToFilm(item.film_id)">
          <q-img
            :src="item.poster_url || '/images/no-poster.jpg'"
            ratio="2/3"
            style="height: 300px"
          >
            <div class="absolute-bottom text-center">
              <div class="text-h6">{{ item.naslov || `Film ${item.film_id}` }}</div>
              <div class="text-subtitle2">{{ item.godina || '2024' }}</div>
            </div>
          </q-img>

          <q-card-section>
            <!-- DODANO: Naziv filma kao tekst -->
            <div class="text-h6 q-mb-sm">
              {{ item.naslov || `Film ID: ${item.film_id}` }}
            </div>
            
            <div class="row justify-between items-center">
              <q-chip 
                :label="item.status" 
                :color="item.status === 'gledano' ? 'green' : 'blue'"
                text-color="white"
                size="sm"
              />
              
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click.stop="removeFromWatchlist(item.film_id, item.naslov || `Film ${item.film_id}`)"
              >
                <q-tooltip>Ukloni iz liste</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { filmsAPI, userAPI } from '../services/api'

defineOptions({
  name: 'WatchlistPage'
})

const router = useRouter()

const watchlist = ref([])
const loading = ref(false)
const activeTab = ref('all')

const filteredWatchlist = computed(() => {
  if (activeTab.value === 'all') return watchlist.value
  return watchlist.value.filter(item => item.status === activeTab.value)
})

const loadWatchlist = async () => {
  loading.value = true
  try {
    const response = await userAPI.getWatchlist()
    const watchlistItems = response.data.watchlist
    
    // Dohvati podatke za svaki film
    for (let item of watchlistItems) {
      try {
        const filmResponse = await filmsAPI.getById(item.film_id)
        item.naslov = filmResponse.data.film.naslov
        item.godina = filmResponse.data.film.godina
        item.poster_url = filmResponse.data.film.poster_url
      } catch (filmError) {
        console.error(`Error loading film ${item.film_id}:`, filmError)
        item.naslov = `Film ${item.film_id}`
        item.godina = '2024'
      }
    }
    
    watchlist.value = watchlistItems
  } catch (error) {
    console.error('Load watchlist error:', error)
    alert('Greška pri dohvaćanju liste')
  } finally {
    loading.value = false
  }
}

const removeFromWatchlist = async (filmId, naslov) => {
  if (!confirm(`Ukloniti "${naslov}" iz liste?`)) return

  try {
    await userAPI.removeFromWatchlist(filmId)
    loadWatchlist() // Reload
    alert('Uklonjeno iz liste')
  } catch (error) {
    console.error('Remove error:', error)
    alert('Greška pri uklanjanju')
  }
}

const goToFilm = (filmId) => {
  router.push(`/film/${filmId}`)
}

onMounted(() => {
  loadWatchlist()
})
</script>