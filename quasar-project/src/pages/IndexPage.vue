<!-- frontend/src/pages/IndexPage.vue -->
<template>
  <q-page class="flex flex-center bg-gradient">
    <div class="column items-center q-gutter-md text-center">
      <!-- Logo/Header -->
      <div class="text-h2 text-white text-bold">
        🎬 MovieBox
      </div>
      
      <div class="text-h5 text-white text-weight-light">
        Vaš omiljeni portal za filmove i serije
      </div>

      <div class="text-body1 text-white q-mt-lg" style="max-width: 600px">
        Otkrijte nove filmove, ocijenite svoje omiljene naslove, 
        kreirajte watchlist i podijelite mišljenja s drugima.
      </div>

      <!-- Action Buttons -->
      <div class="row q-gutter-md q-mt-xl">
        <q-btn
          label="Pregledaj Filmove"
          color="primary"
          size="lg"
          to="/filmovi"
          class="q-px-xl"
        />
        
        <q-btn
          v-if="!isLoggedIn"
          label="Registriraj se"
          color="secondary"
          size="lg"
          outline
          to="/registracija"
          class="q-px-xl"
        />

        <q-btn
          v-if="isLoggedIn"
          label="Moja Lista"
          color="secondary"
          size="lg"
          outline
          to="/watchlist"
          class="q-px-xl"
        />
      </div>

      <!-- Features -->
      <div class="row q-gutter-lg q-mt-xl" style="max-width: 800px">
        <div class="col-12 col-md-4 text-center">
          <q-icon name="movie" size="3rem" color="white" />
          <div class="text-h6 text-white q-mt-sm">Otkrijte</div>
          <div class="text-body2 text-white">
            Pronađite nove filmove i serije
          </div>
        </div>

        <div class="col-12 col-md-4 text-center">
          <q-icon name="star" size="3rem" color="white" />
          <div class="text-h6 text-white q-mt-sm">Ocijenite</div>
          <div class="text-body2 text-white">
            Podijelite svoje mišljenje
          </div>
        </div>

        <div class="col-12 col-md-4 text-center">
          <q-icon name="bookmark" size="3rem" color="white" />
          <div class="text-h6 text-white q-mt-sm">Organizirajte</div>
          <div class="text-body2 text-white">
            Kreirajte vlastite liste
          </div>
        </div>
      </div>

      <!-- User Greeting -->
      <div v-if="isLoggedIn" class="text-h6 text-white q-mt-xl">
        Dobro došao/la, {{ user?.first_name || user?.username }}! 👋
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

defineOptions({
  name: 'IndexPage'
})

const user = ref(null)

const isLoggedIn = computed(() => !!user.value)

function loadUser() {
  const userData = localStorage.getItem('moviebox_user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.q-page {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>