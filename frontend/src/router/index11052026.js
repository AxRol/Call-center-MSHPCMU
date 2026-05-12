/* import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

export default router */

import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Formulaire_appel from '@/views/front_office/Formulaire_appel.vue'
import Inscription from '@/views/Inscription.vue'
import Dashboard from '@/views/back_office/Dashboard.vue'
import Appels from '@/views/back_office/Appels.vue'
import Types_Appels from '@/views/back_office/Types_Appels.vue'
import Types_Requetes from '@/views/back_office/Types_Requetes.vue'
import Tickets from '@/views/back_office/Tickets.vue'
import localite from '@/views/back_office/Localite.vue'
import Rapports from '@/views/back_office/Rapports.vue'
import Utilisateurs from '@/views/back_office/Utilisateurs.vue'
import Equipes from '@/views/back_office/Equipes.vue'

// note: component name matches file spelling (Dashbord) intentionally


const routes = [

  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  // {path: '/logout', name: 'Logout', component: Login },
  { path: '/inscription', name: 'Inscription', component: Inscription  },
  { path: '/front_office/formulaire_appel', name: 'Formulaire_appel', component: Formulaire_appel},


  { path: '/back_office/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/back_office/appels', name: 'Appels', component: Appels },
  { path: '/back_office/typeappels', name: 'Types_Appels', component: Types_Appels },
  { path: '/back_office/typerequetes', name: 'Types_Requetes', component: Types_Requetes },
  { path: '/back_office/tickets', name: 'Tickets', component: Tickets },
  { path: '/back_office/localites', name: 'localite', component: localite },
  { path: '/back_office/rapports', name: 'Rapports', component: Rapports },
  { path: '/back_office/utilisateurs', name: 'Utilisateurs', component: Utilisateurs },
  { path: '/back_office/equipes', name: 'Equipes', component: Equipes },

]

const router = createRouter({
 history:createWebHistory(),
 routes
})

export default router
