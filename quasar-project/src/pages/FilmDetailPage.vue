<!-- frontend/src/pages/FilmDetailPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="flex flex-center">
      <q-spinner size="50px" color="primary" />
    </div>

    <div v-else-if="film" class="row q-gutter-lg">
      <!-- Film Info -->
      <div class="col-12 col-md-8">
        <div class="row q-gutter-md">
          <!-- Poster -->
          <div class="col-12 col-sm-4">
            <q-img
              :src="film.poster_url || '/images/no-poster.jpg'"
              ratio="2/3"
              style="max-width: 300px"
              class="rounded-borders"
            />
          </div>

          <!-- Details -->
          <div class="col-12 col-sm-8">
            <h3 class="q-mt-none">{{ film.naslov }}</h3>
            
            <div class="q-mb-md">
              <q-chip 
                :label="film.type" 
                :color="film.type === 'film' ? 'blue' : 'green'"
                text-color="white"
                class="q-mr-sm"
              />
              <q-chip 
                v-if="film.godina"
                :label="film.godina"
                outline
                class="q-mr-sm"
              />
              <q-chip 
                v-if="film.imdb_rating"
                :label="`IMDB: ${film.imdb_rating}`"
                color="amber"
                text-color="black"
              />
            </div>

            <div class="q-mb-md">
              <strong>Žanr:</strong> {{ film.zanr }}
            </div>

            <div v-if="film.duration_minutes" class="q-mb-md">
              <strong>Trajanje:</strong> {{ film.duration_minutes }} minuta
            </div>

            <div class="q-mb-md">
              <strong>Prosječna ocjena:</strong>
              <span v-if="film.avg_rating">
                {{ film.avg_rating }}/5 ({{ film.total_ratings }} ocjena)
              </span>
              <span v-else>Nema ocjena</span>
            </div>

            <p class="text-body1">{{ film.opis }}</p>

            <!-- Watchlist & Rating Actions -->
            <div v-if="isLoggedIn" class="q-mt-md">
              <q-btn-group>
                <q-btn 
                  label="Dodaj u Planirano"
                  color="primary"
                  @click="addToWatchlist('planirano')"
                  :loading="watchlistLoading"
                />
                <q-btn 
                  label="Označi kao Gledano"
                  color="positive"
                  @click="addToWatchlist('gledano')"
                  :loading="watchlistLoading"
                />
              </q-btn-group>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating & Comments -->
      <div class="col-12 col-md-4">
        <!-- User Rating -->
        <q-card v-if="isLoggedIn" class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Tvoja ocjena</div>
            <div class="q-mt-md">
              <q-rating
                v-model="userRating"
                max="5"
                size="2em"
                @update:model-value="submitRating"
              />
              <div v-if="userRating" class="text-center q-mt-sm">
                {{ userRating }}/5
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Add Comment -->
        <q-card v-if="isLoggedIn" class="q-mb-md">
          <q-card-section>
          <textarea
          v-model="newComment"
         placeholder="Vaš komentar..."
          rows="3"
          style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; font-family: inherit; margin-top: 16px;"
></textarea>
            <q-btn
              label="Objavi"
              color="primary"
              @click="submitComment"
              :loading="commentLoading"
              :disable="!newComment.trim()"
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>

        <!-- Login prompt -->
        <q-card v-else class="q-mb-md">
          <q-card-section class="text-center">
            <p>Prijavite se da biste mogli ocjenjivati i komentirati</p>
            <q-btn label="Prijava" color="primary" to="/login" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Comments Section -->
      <div class="col-12">
        <div class="text-h5 q-mb-md">
          Komentari ({{ comments.length }})
        </div>

        <div v-if="commentsLoading" class="flex flex-center">
          <q-spinner size="30px" />
        </div>

        <div v-else-if="comments.length === 0" class="text-center text-grey-6">
          Nema komentara za ovaj film
        </div>

        <div v-else class="q-gutter-md">
          <q-card 
            v-for="comment in comments" 
            :key="comment.id"
            flat
            bordered
          >
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <strong>{{ comment.username }}</strong>
                  <div class="text-grey-6 text-caption">
                    {{ formatDate(comment.datum) }}
                  </div>
                </div>
              </div>
              <p class="q-mt-md q-mb-none">{{ comment.tekst }}</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else class="text-center">
      <h4>Film nije pronađen</h4>
      <q-btn label="Povratak na filmove" to="/filmovi" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { filmsAPI, reviewsAPI, commentsAPI, userAPI } from '../services/api'

defineOptions({
  name: 'FilmDetailPage'
})

const route = useRoute()
const router = useRouter()

const film = ref(null)
const loading = ref(true)
const comments = ref([])
const commentsLoading = ref(false)
const userRating = ref(0)
const newComment = ref('')
const commentLoading = ref(false)
const watchlistLoading = ref(false)

const user = ref(null)

const isLoggedIn = computed(() => !!user.value)

// Load user data
const loadUser = () => {
  const userData = localStorage.getItem('moviebox_user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
}

// Load film details
const loadFilm = async () => {
  loading.value = true
  try {
    const response = await filmsAPI.getById(route.params.id)
    film.value = response.data.film
  } catch (error) {
    console.error('Load film error:', error)
    film.value = null
  } finally {
    loading.value = false
  }
}

// Load comments
const loadComments = async () => {
  commentsLoading.value = true
  try {
    const response = await commentsAPI.getByFilm(route.params.id)
    comments.value = response.data.comments
  } catch (error) {
    console.error('Load comments error:', error)
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

// Submit rating
const submitRating = async (rating) => {
  if (!isLoggedIn.value || !rating) return

  try {
    await reviewsAPI.add({
      film_id: parseInt(route.params.id),
      vrijednost: rating
    })
    
    // Reload film to update average rating
    loadFilm()
  } catch (error) {
    console.error('Submit rating error:', error)
    alert('Greška pri ocjenjivanju: ' + error.response?.data?.message)
  }
}

// Submit comment
const submitComment = async () => {
  if (!isLoggedIn.value || !newComment.value.trim()) return

  commentLoading.value = true
  try {
    await commentsAPI.add({
      film_id: parseInt(route.params.id),
      tekst: newComment.value.trim()
    })
    
    newComment.value = ''
    loadComments() // Reload comments
  } catch (error) {
    console.error('Submit comment error:', error)
    alert('Greška pri dodavanju komentara: ' + error.response?.data?.message)
  } finally {
    commentLoading.value = false
  }
}

// Add to watchlist
const addToWatchlist = async (status) => {
  if (!isLoggedIn.value) return

  watchlistLoading.value = true
  try {
    await userAPI.addToWatchlist({
      film_id: parseInt(route.params.id),
      status: status
    })
    
    alert(`Film dodan u ${status === 'gledano' ? 'gledane' : 'planirane'}!`)
  } catch (error) {
    console.error('Add to watchlist error:', error)
    alert('Greška pri dodavanju u listu: ' + error.response?.data?.message)
  } finally {
    watchlistLoading.value = false
  }
}

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadUser()
  loadFilm()
  loadComments()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>