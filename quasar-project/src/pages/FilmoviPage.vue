<!-- frontend/src/pages/FilmoviPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4>MovieBox - Filmovi i Serije</h4>
      </div>
    </div>

    <!-- Search and Filters -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-md-4 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.search"
              label="Pretraži filmove..."
              filled
              @keyup.enter="loadFilms"
            >
              <template v-slot:append>
                <q-icon name="search" @click="loadFilms" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.type"
              :options="typeOptions"
              label="Tip"
              filled
              clearable
            emit-value
            map-options
              @update:model-value="loadFilms"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.zanr"
              :options="zanrOptions"
              label="Žanr"
              filled
              clearable
            emit-value
            map-options
              @update:model-value="loadFilms"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-input
              v-model.number="filters.godina"
              label="Godina"
              type="number"
              filled
              clearable
              @keyup.enter="loadFilms"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-btn
              label="Pretraži"
              color="primary"
              @click="loadFilms"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Films Grid -->
    <div class="row q-gutter-md">
      <div
        v-for="film in films"
        :key="film.id"
        class="col-lg-3 col-md-4 col-sm-6 col-xs-12"
      >
        <q-card class="film-card cursor-pointer" @click="goToFilm(film.id)">
          <q-img
            :src="film.poster_url || '/images/no-poster.jpg'"
            ratio="2/3"
            style="height: 300px"
          >
            <div class="absolute-bottom text-center">
              <div class="text-h6">{{ film.naslov }}</div>
              <div class="text-subtitle2">{{ film.godina }}</div>
            </div>
          </q-img>

          <q-card-section>
            <div class="text-body2 ellipsis-2-lines">
              {{ film.naslov }}
            </div>
            
            <div class="row justify-between items-center q-mt-sm">
              <q-chip 
                :label="film.type" 
                :color="film.type === 'film' ? 'blue' : 'green'"
                text-color="white"
                size="sm"
              />
              
              <div v-if="film.imdb_rating">
                <q-icon name="star" color="amber" />
                {{ film.imdb_rating }}
              </div>
            </div>

            <div class="text-caption q-mt-xs">
              {{ film.zanr }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-mt-xl">
      <q-spinner size="50px" color="primary" />
    </div>

    <!-- No results -->
    <div v-if="!loading && films.length === 0" class="text-center q-mt-xl">
      <q-icon name="movie" size="4rem" color="grey-5" />
      <div class="text-h6 text-grey-6 q-mt-md">
        Nema rezultata
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex flex-center q-mt-lg">
      <q-pagination
        v-model="pagination.page"
        :max="pagination.pages"
        direction-links
        boundary-links
        @update:model-value="loadFilms"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { filmsAPI } from '../services/api'

defineOptions({
  name: 'FilmoviPage'
})

const router = useRouter()
const $q = useQuasar()

const films = ref([])
const loading = ref(false)

const filters = ref({
  search: '',
  type: '',
  zanr: '',
  godina: null
})

const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0
})

const typeOptions = [
  { label: 'Film', value: 'film' },
  { label: 'Serija', value: 'serija' }
]

const zanrOptions = [
  { label: 'Action', value: 'Action' },
  { label: 'Comedy', value: 'Comedy' },
  { label: 'Drama', value: 'Drama' },
  { label: 'Horror', value: 'Horror' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Sci-Fi', value: 'Sci-Fi' },
  { label: 'Thriller', value: 'Thriller' }
]

const loadFilms = async () => {
  loading.value = true

  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value
    }

    // Ukloni prazne parametre
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })

    const response = await filmsAPI.getAll(params)
    
    films.value = response.data.films
    pagination.value = response.data.pagination
    
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Greška pri dohvaćanju filmova',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const goToFilm = (filmId) => {
  console.log('goToFilm called with ID:', filmId)
  console.log('Current route:', router.currentRoute.value.path)
  console.log('Trying to navigate to:', `/film/${filmId}`)
  
  router.push(`/film/${filmId}`)
    .then(() => {
      console.log('Navigation successful')
    })
    .catch((error) => {
      console.error('Navigation failed:', error)
    })
}

onMounted(() => {
  loadFilms()
})
</script>

<style scoped>
.film-card {
  transition: transform 0.2s;
}

.film-card:hover {
  transform: translateY(-5px);
}

.ellipsis-2-lines {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>