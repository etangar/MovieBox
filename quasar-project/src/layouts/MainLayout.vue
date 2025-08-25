<!-- frontend/src/layouts/MainLayout.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <router-link to="/" class="text-white text-decoration-none">
            MovieBox
          </router-link>
        </q-toolbar-title>

        <!-- User menu -->
        <div v-if="isLoggedIn">
          <q-btn flat round>
            <q-avatar size="35px">
              <q-icon name="person" />
            </q-avatar>
            <q-menu>
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ user?.username }}</q-item-label>
                    <q-item-label caption>{{ user?.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="logout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>Odjava</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <div v-else>
          <q-btn flat label="Prijava" to="/login" />
          <q-btn flat label="Registracija" to="/registracija" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          MovieBox Navigacija
        </q-item-label>

        <q-item clickable to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Početna</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable to="/filmovi">
          <q-item-section avatar>
            <q-icon name="movie" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Filmovi</q-item-label>
          </q-item-section>
        </q-item>

        <template v-if="isLoggedIn">
          <q-item clickable to="/watchlist">
            <q-item-section avatar>
              <q-icon name="bookmark" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Moja Lista</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable to="/profile">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Profil</q-item-label>
            </q-item-section>
          </q-item>

          <template v-if="isAdmin">
            <q-separator />
            <q-item-label header>
              Admin Panel
            </q-item-label>

            <q-item clickable to="/admin">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Administracija</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </template>

        <template v-else>
          <q-item clickable to="/login">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Prijava</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable to="/registracija">
            <q-item-section avatar>
              <q-icon name="person_add" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Registracija</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'MainLayout'
})

const router = useRouter()
const $q = useQuasar()

const leftDrawerOpen = ref(false)
const user = ref(null)

const isLoggedIn = computed(() => !!user.value)
const isAdmin = computed(() => user.value?.role === 'admin')

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function loadUser() {
  const userData = localStorage.getItem('moviebox_user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
}

function logout() {
  localStorage.removeItem('moviebox_token')
  localStorage.removeItem('moviebox_user')
  user.value = null
  
  $q.notify({
    type: 'positive',
    message: 'Uspješno ste se odjavili',
    position: 'top'
  })
  
  router.push('/login')
}

onMounted(() => {
  loadUser()
  
  // Listen for storage changes (when user logs in from another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'moviebox_user') {
      loadUser()
    }
  })
})
</script>

<style scoped>
.text-decoration-none {
  text-decoration: none;
}
</style>