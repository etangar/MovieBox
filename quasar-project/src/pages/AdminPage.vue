<!-- frontend/src/pages/AdminPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-lg">Admin Panel</div>
    
    <q-tabs v-model="activeTab" class="text-primary">
      <q-tab name="users" label="Korisnici" />
      <q-tab name="films" label="Filmovi" />
      <q-tab name="comments" label="Komentari" />
    </q-tabs>

    <q-separator class="q-my-md" />

    <!-- Users Tab -->
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="users">
        <div class="text-h6 q-mb-md">Upravljanje korisnicima</div>
        
        <!-- Search -->
        <q-input 
          v-model="userSearch" 
          placeholder="Pretraži korisnike..." 
          class="q-mb-md"
          @keyup.enter="loadUsers"
        >
          <template v-slot:append>
            <q-btn flat round icon="search" @click="loadUsers" />
          </template>
        </q-input>

        <!-- Users Table -->
        <q-table
          :rows="users"
          :columns="userColumns"
          :loading="usersLoading"
          row-key="id"
          class="q-mb-md"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn 
                v-if="props.row.role !== 'admin'"
                flat 
                round 
                color="negative" 
                icon="delete"
                @click="deleteUser(props.row.id, props.row.username)"
              >
                <q-tooltip>Obriši korisnika</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <q-btn 
          label="Osvježi" 
          color="primary" 
          @click="loadUsers"
          :loading="usersLoading"
        />
      </q-tab-panel>

      <!-- Films Tab -->
      <q-tab-panel name="films">
        <div class="text-h6 q-mb-md">Upravljanje filmovima</div>
        
        <q-btn 
          label="Dodaj novi film" 
          color="primary" 
          class="q-mb-md"
          @click="showAddFilmDialog = true"
        />

        <!-- Films Table -->
        <q-table
          :rows="films"
          :columns="filmColumns"
          :loading="filmsLoading"
          row-key="id"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn 
                flat 
                round 
                color="negative" 
                icon="delete"
                @click="deleteFilm(props.row.id, props.row.naslov)"
              >
                <q-tooltip>Obriši film</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Comments Tab -->
      <q-tab-panel name="comments">
        <div class="text-h6 q-mb-md">Moderacija komentara</div>
        
        <!-- Comments Table -->
        <q-table
          :rows="comments"
          :columns="commentColumns"
          :loading="commentsLoading"
          row-key="id"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn 
                flat 
                round 
                color="negative" 
                icon="delete"
                @click="deleteComment(props.row.id)"
              >
                <q-tooltip>Obriši komentar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Add Film Dialog -->
    <q-dialog v-model="showAddFilmDialog">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">Dodaj novi film</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addFilm">
            <q-input v-model="newFilm.naslov" label="Naslov" required class="q-mb-md" />
            <q-textarea v-model="newFilm.opis" label="Opis" class="q-mb-md" />
            <q-input v-model="newFilm.zanr" label="Žanr" class="q-mb-md" />
            <q-input v-model.number="newFilm.godina" label="Godina" type="number" class="q-mb-md" />
            <q-select 
              v-model="newFilm.type" 
              :options="['film', 'serija']" 
              label="Tip" 
              required 
              class="q-mb-md" 
            />
            <q-input v-model="newFilm.poster_url" label="Poster URL" class="q-mb-md" />
            <q-input v-model.number="newFilm.imdb_rating" label="IMDB Rating" type="number" step="0.1" class="q-mb-md" />
            <q-input v-model.number="newFilm.duration_minutes" label="Trajanje (min)" type="number" class="q-mb-md" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" @click="showAddFilmDialog = false" />
          <q-btn label="Dodaj" color="primary" @click="addFilm" :loading="addingFilm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI, filmsAPI } from '../services/api'

defineOptions({
  name: 'AdminPage'
})

const activeTab = ref('users')

// Users
const users = ref([])
const usersLoading = ref(false)
const userSearch = ref('')

const userColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'username', label: 'Korisničko ime', field: 'username', sortable: true },
  { name: 'email', label: 'Email', field: 'email', sortable: true },
  { name: 'first_name', label: 'Ime', field: 'first_name' },
  { name: 'last_name', label: 'Prezime', field: 'last_name' },
  { name: 'role', label: 'Uloga', field: 'role' },
  { name: 'created_at', label: 'Kreiran', field: 'created_at' },
  { name: 'actions', label: 'Akcije', field: 'actions' }
]

// Films
const films = ref([])
const filmsLoading = ref(false)
const showAddFilmDialog = ref(false)
const addingFilm = ref(false)
const newFilm = ref({
  naslov: '',
  opis: '',
  zanr: '',
  godina: null,
  type: '',
  poster_url: '',
  imdb_rating: null,
  duration_minutes: null
})

const filmColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'naslov', label: 'Naslov', field: 'naslov', sortable: true },
  { name: 'zanr', label: 'Žanr', field: 'zanr' },
  { name: 'godina', label: 'Godina', field: 'godina', sortable: true },
  { name: 'type', label: 'Tip', field: 'type' },
  { name: 'imdb_rating', label: 'IMDB', field: 'imdb_rating', sortable: true },
  { name: 'actions', label: 'Akcije', field: 'actions' }
]

// Comments
const comments = ref([])
const commentsLoading = ref(false)

const commentColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'username', label: 'Korisnik', field: 'username' },
  { name: 'film_id', label: 'Film ID', field: 'film_id' },
  { name: 'tekst', label: 'Tekst', field: 'tekst' },
  { name: 'datum', label: 'Datum', field: 'datum' },
  { name: 'actions', label: 'Akcije', field: 'actions' }
]

// Load Users
const loadUsers = async () => {
  usersLoading.value = true
  try {
    const response = await adminAPI.getUsers({ search: userSearch.value })
    users.value = response.data.users
  } catch (error) {
    alert('Greška pri dohvaćanju korisnika: ' + error.response?.data?.message)
  } finally {
    usersLoading.value = false
  }
}

// Delete User
const deleteUser = async (userId, username) => {
  if (!confirm(`Jeste li sigurni da želite obrisati korisnika "${username}"?`)) {
    return
  }

  try {
    await adminAPI.deleteUser(userId)
    alert('Korisnik obrisan uspješno')
    loadUsers()
  } catch (error) {
    alert('Greška pri brisanju korisnika: ' + error.response?.data?.message)
  }
}

// Load Films
const loadFilms = async () => {
  filmsLoading.value = true
  try {
    const response = await filmsAPI.getAll()
    films.value = response.data.films
  } catch (error) {
    alert('Greška pri dohvaćanju filmova: ' + error.response?.data?.message)
  } finally {
    filmsLoading.value = false
  }
}

// Add Film
const addFilm = async () => {
  addingFilm.value = true
  try {
    await filmsAPI.create(newFilm.value)
    alert('Film dodan uspješno')
    showAddFilmDialog.value = false
    
    // Reset form
    newFilm.value = {
      naslov: '',
      opis: '',
      zanr: '',
      godina: null,
      type: '',
      poster_url: '',
      imdb_rating: null,
      duration_minutes: null
    }
    
    loadFilms()
  } catch (error) {
    alert('Greška pri dodavanju filma: ' + error.response?.data?.message)
  } finally {
    addingFilm.value = false
  }
}

// Delete Film
const deleteFilm = async (filmId, naslov) => {
  if (!confirm(`Jeste li sigurni da želite obrisati film "${naslov}"?`)) {
    return
  }

  try {
    await filmsAPI.delete(filmId)
    alert('Film obrisan uspješno')
    loadFilms()
  } catch (error) {
    alert('Greška pri brisanju filma: ' + error.response?.data?.message)
  }
}

// Load Comments (placeholder - potrebno dodati u API)
const loadComments = async () => {
  // Implementiraj kad dodaš admin comments endpoint
  comments.value = []
}

// Delete Comment
const deleteComment = async (commentId) => {
  if (!confirm('Jeste li sigurni da želite obrisati ovaj komentar?')) {
    return
  }

  try {
    await adminAPI.deleteComment(commentId)
    alert('Komentar obrisan uspješno')
    loadComments()
  } catch (error) {
    alert('Greška pri brisanju komentara: ' + error.response?.data?.message)
  }
}

onMounted(() => {
  loadUsers()
  loadFilms()
  loadComments()
})
</script>