const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/login', component: () => import('pages/LoginPage.vue') },
      { path: '/registracija', component: () => import('pages/RegistracijaPage.vue') },
      { path: '/filmovi', component: () => import('pages/FilmoviPage.vue') },
      { path: '/admin', component: () => import('pages/AdminPage.vue') },
      { path: '/admin', component: () => import('pages/AdminPage.vue') },
      { path: '/film/:id', component: () => import('pages/FilmDetailPage.vue') },
      { path: '/watchlist', component: () => import('pages/WatchlistPage.vue') },
      { path: '/profile', component: () => import('pages/ProfilePage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes